
INSERT INTO users(email, password)
SELECT 'admin@zen.dro', 'admin'
WHERE NOT EXISTS (
  SELECT id FROM users WHERE email = 'admin@zen.dro' AND password = 'admin'
);

INSERT INTO roles(name)
SELECT 'admin'
WHERE NOT EXISTS (
  SELECT id FROM roles WHERE name = 'admin'
);

INSERT INTO role_to_users ("userId", "roleId")
SELECT (SELECT id FROM users WHERE email = 'admin@zen.dro' AND password = 'admin'), 
       (SELECT id FROM roles WHERE name = 'admin')
WHERE NOT EXISTS (
  SELECT id FROM role_to_users 
  WHERE 
    "userId" = (SELECT id FROM users WHERE email = 'admin@zen.dro' AND password = 'admin') AND
    "roleId" = (SELECT id FROM roles WHERE name = 'admin')
);
