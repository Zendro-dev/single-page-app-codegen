
INSERT INTO users (email, password)
SELECT 'admin@scidb.org', '123'
WHERE NOT EXISTS (
  SELECT id FROM users WHERE email = 'admin@scidb.org' AND password = '123'
);

INSERT INTO roles (name)
SELECT 'admin'
WHERE NOT EXISTS (
  SELECT id FROM roles WHERE name = 'admin'
);
