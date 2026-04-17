CREATE TABLE IF NOT EXISTS plan (
  id             SERIAL PRIMARY KEY,
  plan_name      VARCHAR(20) UNIQUE NOT NULL,
  req_per_minute INT         NOT NULL DEFAULT 10,
  req_per_day    INT         NOT NULL DEFAULT 100,
  req_per_month  INT         NOT NULL DEFAULT 1000,
  is_active      BOOLEAN     NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS users (
  id         SERIAL       PRIMARY KEY,
  username   VARCHAR(50)  UNIQUE NOT NULL,
  email      VARCHAR(100) UNIQUE NOT NULL,
  password   TEXT         NOT NULL,
  plan_id    INT          NOT NULL DEFAULT 1 REFERENCES plan(id),
  role       VARCHAR(20)  NOT NULL DEFAULT 'user',
  api_key    VARCHAR(64)  UNIQUE,
  is_active  BOOLEAN      NOT NULL DEFAULT true,
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE provinces (
  id        SERIAL        PRIMARY KEY,
  name      VARCHAR(100)  NOT NULL UNIQUE
);

CREATE TABLE weather_logs (
  id           SERIAL           PRIMARY KEY,
  province_id  INT              NOT NULL REFERENCES provinces(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  temperature  DECIMAL(5, 2)   NOT NULL,
  humidity     DECIMAL(5, 2)   NOT NULL,
  wind_speed   DECIMAL(6, 2)   NOT NULL,
  condition    VARCHAR(100)     NOT NULL,
  icon         VARCHAR(10)      NULL,
  updated_at   TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_province_updated ON weather_logs (province_id, updated_at DESC);

CREATE TABLE usage_quota (
  id               SERIAL    PRIMARY KEY,
  user_id          INT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quota_date       DATE      NOT NULL DEFAULT CURRENT_DATE,
  used_today       INT       NOT NULL DEFAULT 0,
  used_this_month  INT       NOT NULL DEFAULT 0,
  last_request_at  TIMESTAMP,
  reset_at         TIMESTAMP,
  UNIQUE (user_id, quota_date)
);

CREATE INDEX idx_quota_user_date ON usage_quota(user_id, quota_date);

CREATE TABLE api_usage (
  id            BIGSERIAL  PRIMARY KEY,
  user_id       INT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint      VARCHAR(255),
  method        VARCHAR(10),
  status_code   INT,
  response_ms   DECIMAL(12,3),
  ip_address    INET,
  requested_at  TIMESTAMP  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_log_user_time ON api_usage(user_id, requested_at DESC);
CREATE INDEX idx_log_requested_at ON api_usage(requested_at DESC);

-----------------------

INSERT INTO plan (plan_name, req_per_minute, req_per_day, req_per_month) VALUES
    ('free',       5,  10,   1000),
    ('pro',        60,  1000,  30000),
    ('enterprise', 120, 5000,  100000);

INSERT INTO users (username, email, password, plan_id, role,is_active, created_at)
VALUES 
    (
        'admin',
        'admin@example.com',
        -- password : password
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        3,
        'admin',
        true,
        NOW()
    ),
    (
        'testuser',
        'test@example.com',
        -- password : password
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        1,
        'user',
        true,
        NOW()
    );

INSERT INTO provinces (name) VALUES 
  ('กรุงเทพมหานคร'),
  ('เชียงใหม่'),
  ('ภูเก็ต'),
  ('ขอนแก่น'),
  ('ชลบุรี');

INSERT INTO weather_logs
  (province_id, temperature, humidity, wind_speed, condition, icon, updated_at)
VALUES
  (1, 34, 64, 25, 'แดดจัด',       '☀️',  '2026-04-17 10:00:00.000'),
  (2, 28, 72, 15, 'มีเมฆบางส่วน', '⛅',  '2026-04-17 10:00:00.000'),
  (3, 33, 80, 30, 'ฝนตกเล็กน้อย', '🌧️', '2026-04-17 10:00:00.000'),
  (4, 36, 55, 10, 'ร้อนจัด',      '🌡️', '2026-04-17 10:00:00.000'),
  (5, 32, 75, 20, 'มีเมฆมาก',     '☁️',  '2026-04-17 10:00:00.000');