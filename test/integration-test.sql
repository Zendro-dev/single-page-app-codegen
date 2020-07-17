
INSERT INTO users(email, password)
SELECT 'admin@zen.dro', '$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa'
WHERE NOT EXISTS (
  SELECT id FROM users WHERE email = 'admin@zen.dro' AND password = '$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa'
);

INSERT INTO roles(name)
SELECT 'admin'
WHERE NOT EXISTS (
  SELECT id FROM roles WHERE name = 'admin'
);

INSERT INTO role_to_users ("userId", "roleId")
SELECT (SELECT id FROM users WHERE email = 'admin@zen.dro' AND password = '$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa'), 
       (SELECT id FROM roles WHERE name = 'admin')
WHERE NOT EXISTS (
  SELECT id FROM role_to_users 
  WHERE 
    "userId" = (SELECT id FROM users WHERE email = 'admin@zen.dro' AND password = '$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa') AND
    "roleId" = (SELECT id FROM roles WHERE name = 'admin')
);
