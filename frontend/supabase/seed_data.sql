-- Create Teams
INSERT INTO teams (id, name, short_name, logo_url)
VALUES 
    ('t1', 'India', 'IND', 'https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg'),
    ('t2', 'Australia', 'AUS', 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Flag_of_Australia.svg')
ON CONFLICT (id) DO NOTHING;

-- Create a LIVE Match
INSERT INTO matches (id, home_team_id, away_team_id, start_time, status, score_home, score_away, current_time)
VALUES 
    ('m1', 't1', 't2', NOW(), 'live', 245, 230, TO_CHAR(NOW(), 'HH24:MI'))
ON CONFLICT (id) DO NOTHING;

-- Create some initial events
INSERT INTO match_events (match_id, type, description, score_update)
VALUES 
    ('m1', 'run', 'Kohli drives for a single', '{"runs": 1}'),
    ('m1', 'boundary', 'Rohit smashes a boundary!', '{"runs": 4}'),
    ('m1', 'wicket', 'Smith is OUT! caught behind', '{"runs": 0}')
ON CONFLICT DO NOTHING;
