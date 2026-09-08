-- 1. Restrição de Horário de Funcionamento (Matriz Horária)
-- DOW 1 = Segunda, DOW 2 a 5 = Terça a Sexta, DOW 6 a 7 = Sábado a Domingo
ALTER TABLE reservas ADD CONSTRAINT chk_horario_funcionamento CHECK (
    EXTRACT(ISODOW FROM data_evento AT TIME ZONE 'Europe/Lisbon') != 1
    AND
    (
        (EXTRACT(ISODOW FROM data_evento AT TIME ZONE 'Europe/Lisbon') BETWEEN 2 AND 5 
         AND TO_CHAR(data_evento AT TIME ZONE 'Europe/Lisbon', 'HH24:MI') >= '14:00' 
         AND TO_CHAR(data_evento AT TIME ZONE 'Europe/Lisbon', 'HH24:MI') <= '20:00')
        OR
        (EXTRACT(ISODOW FROM data_evento AT TIME ZONE 'Europe/Lisbon') IN (6, 7) 
         AND TO_CHAR(data_evento AT TIME ZONE 'Europe/Lisbon', 'HH24:MI') >= '10:00' 
         AND TO_CHAR(data_evento AT TIME ZONE 'Europe/Lisbon', 'HH24:MI') <= '20:00')
    )
);

-- 2. Função de Consulta de Horários Ocupados (SECURITY DEFINER)
-- Devolve em formato 'HH24:MI' os horários selados ou prestes a serem selados num dado dia
CREATE OR REPLACE FUNCTION obter_horarios_ocupados(p_data DATE)
RETURNS TABLE (hora TEXT)
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT TO_CHAR(data_evento AT TIME ZONE 'Europe/Lisbon', 'HH24:MI')
    FROM reservas
    WHERE (data_evento AT TIME ZONE 'Europe/Lisbon')::DATE = p_data
    AND termos_veracidade = true
    AND estado NOT IN ('CANCELLED', 'REJECTED');
END;
$$ LANGUAGE plpgsql;

-- 3. Prevenção Rigorosa de Double-Booking via Trigger
CREATE OR REPLACE FUNCTION check_horario_disponivel()
RETURNS TRIGGER AS $$
BEGIN
    -- Ignorar verificação se a reserva está a ser cancelada ou rejeitada
    IF NEW.estado IN ('CANCELLED', 'REJECTED') THEN
        RETURN NEW;
    END IF;

    -- Usamos Advisory Locks ao nível de transação com base na data_evento para prevenir race conditions simultâneas ao milissegundo.
    -- pg_advisory_xact_lock irá colocar em fila (bloquear) qualquer outra transação que tente modificar este EXATO milissegundo,
    -- garantindo serialização.
    PERFORM pg_advisory_xact_lock(hashtext(NEW.data_evento::TEXT));

    -- Verificar se existe uma reserva selada para o mesmo horário exato
    -- Só consideramos "ocupado" se a reserva já tiver os termos de veracidade aceites (reservas seladas)
    IF EXISTS (
        SELECT 1 FROM reservas 
        WHERE data_evento = NEW.data_evento 
        AND termos_veracidade = true 
        AND estado NOT IN ('CANCELLED', 'REJECTED')
        AND id != NEW.id -- exclui a própria linha no caso de um UPDATE
    ) THEN
        RAISE EXCEPTION 'Horário indisponível.';
    END IF;

    -- Se esta tentativa não tenta selar a reserva (ex: submissão inicial no Home onde termos_veracidade = false),
    -- a verificação acima já bloqueia o INSERT se a hora já foi reclamada.
    -- Se dois utilizadores tentarem fazer INSERT ao mesmo tempo com termos_veracidade = false, ambos vão passar.
    -- O colapso (fecho) acontece no ReservaClient.tsx, quando tentam alterar termos_veracidade para true.
    -- Quem fechar primeiro ganha o lugar. O segundo leva erro 'Horário indisponível.'

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_double_booking
BEFORE INSERT OR UPDATE ON reservas
FOR EACH ROW
EXECUTE FUNCTION check_horario_disponivel();
