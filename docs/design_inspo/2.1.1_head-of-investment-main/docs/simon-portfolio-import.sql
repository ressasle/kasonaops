-- SQL Script: Import Simon Rolfes Portfolio (account_id: 26001)
-- 
-- USAGE: Replace [USER_ID] with Simon's actual user_id after he registers.
-- Or set the account_id on his profile first, then this data will be linked.
--
-- To import: Run this in the Supabase SQL Editor after replacing [USER_ID]

-- First, ensure the profile has the account_id set:
-- UPDATE profiles SET account_id = '26001' WHERE id = '[USER_ID]';

-- Then insert the 22 portfolio positions:
INSERT INTO holdings_v2 (user_id, account_id, ticker, name, exchange, country, category, sector, owner_comment, ticker_finnhub, ticker_eod)
VALUES
  ('[USER_ID]', '26001', 'ZTS', 'Zoetis', 'NYSE', 'USA', 'Defensiv', 'Tiergesundheit', NULL, 'NYSE:ZTS', 'ZTS.US'),
  ('[USER_ID]', '26001', 'GIVN', 'Givaudan', 'SIX', 'CH', 'Defensiv', 'Chemie/Duft', NULL, 'SWX:GIVN', 'GIVN.SW'),
  ('[USER_ID]', '26001', 'LISN', 'Lindt & Sprüngli', 'SIX', 'CH', 'Defensiv', 'Nahrungsmittel', NULL, 'SWX:LISN', 'LISN.SW'),
  ('[USER_ID]', '26001', 'BEI', 'Beiersdorf', 'Xetra', 'DE', 'Defensiv', 'Konsumgüter', 'Position erweitern bei richtigem Zeitpunkt', 'FRA:BEI', 'BEI.F'),
  ('[USER_ID]', '26001', 'MKC', 'McCormick', 'NYSE', 'USA', 'Defensiv', 'Nahrungsmittel', NULL, 'NYSE:MKC', 'MKC.US'),
  ('[USER_ID]', '26001', 'SCHN', 'Schindler', 'SIX', 'CH', 'Trend Zukunft', 'Industrie', NULL, 'SWX:SCHN', 'SCHN.SW'),
  ('[USER_ID]', '26001', 'OTIS', 'Otis', 'NYSE', 'USA', 'Trend Zukunft', 'Industrie', NULL, 'NYSE:OTIS', 'OTIS.US'),
  ('[USER_ID]', '26001', 'GEBN', 'Geberit', 'SIX', 'CH', 'Trend Zukunft', 'Bau/Sanitär', NULL, 'SWX:GEBN', 'GEBN.SW'),
  ('[USER_ID]', '26001', 'RAA', 'Rational', 'Xetra', 'DE', 'Trend Zukunft', 'Maschinenbau', NULL, 'ETR:RAA', 'RAA.F'),
  ('[USER_ID]', '26001', 'LIN', 'Linde', 'NASDAQ', 'UK/US', 'Trend Zukunft', 'Gase', NULL, 'NASDAQ:LIN', 'LIN.US'),
  ('[USER_ID]', '26001', 'ESL', 'EssilorLuxottica', 'Euronext', 'FR', 'Trend Zukunft', 'Gesundheit/Optik', NULL, 'EPA:EL', 'ESL.PA'),
  ('[USER_ID]', '26001', 'COH', 'Cochlear', 'ASX', 'AU', 'Trend Zukunft', 'Medizintechnik', NULL, 'ASX:COH', 'COH.AU'),
  ('[USER_ID]', '26001', 'CL', 'Colgate-Palmolive', 'NYSE', 'USA', 'Blue Chip', 'Konsumgüter', NULL, 'NYSE:CL', 'CL.US'),
  ('[USER_ID]', '26001', 'MRK', 'Merck & Co.', 'NYSE', 'USA', 'Blue Chip', 'Pharma', NULL, 'NYSE:MRK', 'MRK.US'),
  ('[USER_ID]', '26001', 'NESN', 'Nestlé', 'SIX', 'CH', 'Blue Chip', 'Nahrungsmittel', NULL, 'SWX:NESN', 'NESN.SW'),
  ('[USER_ID]', '26001', 'ROG', 'Roche', 'SIX', 'CH', 'Blue Chip', 'Pharma', NULL, 'SWX:ROG', 'ROG.SW'),
  ('[USER_ID]', '26001', 'DIS', 'Walt Disney', 'NYSE', 'USA', 'Entertainment', NULL, NULL, NULL, 'DIS.US'),
  ('[USER_ID]', '26001', 'SREN', 'Swiss Re', 'SIX', 'CH', 'Sonstige', 'Versicherung', NULL, 'SWX:SREN', 'SREN.SW'),
  ('[USER_ID]', '26001', 'BP', 'BP', 'LSE', 'UK', 'Sonstige', 'Öl & Gas', 'Sondersitauation', 'LON:BP', 'BP.LSE'),
  ('[USER_ID]', '26001', 'WDS', 'Woodside Energy', 'ASX', 'AU', 'Sonstige', 'Öl & Gas', NULL, 'ASX:WDS', 'WDS.AU'),
  ('[USER_ID]', '26001', 'XAUUSD', 'Gold', 'Spot', 'Welt', 'Rohstoffe', 'Edelmetall', NULL, 'CURRENCY:XAUUSD', 'XAUUSD.FOREX'),
  ('[USER_ID]', '26001', 'XAGUSD', 'Silber', 'Spot', 'Welt', 'Rohstoffe', 'Edelmetall', NULL, 'CURRENCY:XAGUSD', 'XAGUSD.FOREX');

-- Create investor profile for Simon:
INSERT INTO investor_profiles_v2 (user_id, account_id, data_granularity, action_frequency, risk_appetite, decision_logic, buy_box_triggers, investment_philosophy, noise_filters)
VALUES (
  '[USER_ID]',
  '26001',
  4,  -- Detailliert
  2,  -- Buy & Hold mit Opportunismus
  3,  -- Moderat
  4,  -- Datengetrieben
  ARRAY['20% unter 52-Wochen-Hoch', 'Guidance-Erhöhung', 'Dividendenerhöhung'],
  'High-Quality Value Investing mit Fokus auf defensive Wachstumstitel und langfristige Outperformance.',
  ARRAY['Krypto News', 'Markt-Spekulation', 'Kurzfristige Volatilität']
);
