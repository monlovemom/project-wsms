CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    username   VARCHAR(50)  UNIQUE NOT NULL,
    email      VARCHAR(100) UNIQUE NOT NULL,
    password   TEXT         NOT NULL,
    plan       VARCHAR(20)  NOT NULL DEFAULT 'free',
    role       VARCHAR(20)  NOT NULL DEFAULT 'user',
    api_key    VARCHAR(64)  UNIQUE NOT NULL,
    is_active  BOOLEAN      NOT NULL DEFAULT true,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE location (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  country_code   CHAR(2),
  lat            FLOAT,
  lon            FLOAT,
  timezone_offset INT,
  owm_city_id    INT UNIQUE
);

CREATE TABLE weather_snapshot (
  id                  SERIAL PRIMARY KEY,
  location_id         INT REFERENCES location(id),
  recorded_at         BIGINT NOT NULL,
  weather_main        VARCHAR(50),
  weather_description VARCHAR(100),
  weather_icon        VARCHAR(10),
  temp                FLOAT,
  feels_like          FLOAT,
  temp_min            FLOAT,
  temp_max            FLOAT,
  pressure            INT,
  humidity            INT,
  sea_level_pressure  INT,
  grnd_level_pressure INT,
  visibility          INT,
  wind_speed          FLOAT,
  wind_deg            INT,
  wind_gust           FLOAT,
  clouds_pct          INT,
  sunrise             BIGINT,
  sunset              BIGINT
);

CREATE INDEX idx_snapshot_location_time 
  ON weather_snapshot(location_id, recorded_at DESC);

-----------------------

INSERT INTO users (username, email, password, plan, role, api_key, is_active, created_at)
VALUES 
    (
        'admin',
        'admin@example.com',
        -- password : password
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'enterprise',
        'admin',
        'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
        true,
        NOW()
    ),
    (
        'testuser',
        'test@example.com',
        -- password : password
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'free',
        'user',
        'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
        true,
        NOW()
    );

INSERT INTO location (name, country_code, lat, lon, timezone_offset, owm_city_id)
VALUES ('Chiang Mai', 'TH', 18.7883, 98.9853, 25200, 1153671);

INSERT INTO weather_snapshot (
    location_id, recorded_at, weather_main, weather_description, weather_icon,
    temp, feels_like, temp_min, temp_max, pressure, humidity,
    sea_level_pressure, grnd_level_pressure, visibility, 
    wind_speed, wind_deg, wind_gust, clouds_pct, sunrise, sunset
)
VALUES (
    1,                   -- location_id (อ้างอิงจากตารางด้านบน)
    1713258000,          -- recorded_at (Unix Timestamp)
    'Clouds',            -- weather_main
    'มีเมฆบางส่วน',        -- weather_description
    '03d',               -- weather_icon
    32.5,                -- temp
    35.2,                -- feels_like
    31.0,                -- temp_min
    34.0,                -- temp_max
    1008,                -- pressure
    45,                  -- humidity
    1008,                -- sea_level_pressure
    970,                 -- grnd_level_pressure
    10000,               -- visibility (เมตร)
    2.5,                 -- wind_speed
    210,                 -- wind_deg
    4.1,                 -- wind_gust
    40,                  -- clouds_pct
    1713222000,          -- sunrise (Unix Timestamp)
    1713267000           -- sunset (Unix Timestamp)
);