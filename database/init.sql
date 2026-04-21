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
  is_active  BOOLEAN      NOT NULL DEFAULT true,
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_keys (
  id         SERIAL       PRIMARY KEY,
  user_id    INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key        VARCHAR(64)  UNIQUE NOT NULL,
  name       VARCHAR(100) NOT NULL DEFAULT 'default',
  is_active  BOOLEAN      NOT NULL DEFAULT true,
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_key ON api_keys(key);

CREATE TABLE provinces (
  id        SERIAL        PRIMARY KEY,
  name      VARCHAR(100)  NOT NULL UNIQUE,
  name_en   VARCHAR(100)  NOT NULL DEFAULT ''
);

CREATE TABLE weather_logs (
  id           SERIAL           PRIMARY KEY,
  province_id  INT              NOT NULL REFERENCES provinces(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  temperature  DECIMAL(5, 2)   NOT NULL,
  humidity     DECIMAL(5, 2)   NOT NULL,
  wind_speed   DECIMAL(6, 2)   NOT NULL,
  condition    VARCHAR(100)     NOT NULL,
  condition_en VARCHAR(100)     NOT NULL DEFAULT '',
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
  api_key_id    INT        REFERENCES api_keys(id) ON DELETE SET NULL,
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

INSERT INTO provinces (name, name_en) VALUES 
  ('กรุงเทพมหานคร', 'Bangkok'),
  ('เชียงใหม่', 'Chiang Mai'),
  ('ภูเก็ต', 'Phuket'),
  ('ขอนแก่น', 'Khon Kaen'),
  ('ชลบุรี', 'Chonburi'),
  ('กระบี่', 'Krabi'),
  ('กาญจนบุรี', 'Kanchanaburi'),
  ('กาฬสินธุ์', 'Kalasin'),
  ('กำแพงเพชร', 'Kamphaeng Phet'),
  ('จันทบุรี', 'Chanthaburi'),
  ('ฉะเชิงเทรา', 'Chachoengsao'),
  ('ชัยนาท', 'Chai Nat'),
  ('ชัยภูมิ', 'Chaiyaphum'),
  ('ชุมพร', 'Chumphon'),
  ('เชียงราย', 'Chiang Rai'),
  ('ตรัง', 'Trang'),
  ('ตราด', 'Trat'),
  ('ตาก', 'Tak'),
  ('นครนายก', 'Nakhon Nayok'),
  ('นครปฐม', 'Nakhon Pathom'),
  ('นครพนม', 'Nakhon Phanom'),
  ('นครราชสีมา', 'Nakhon Ratchasima'),
  ('นครศรีธรรมราช', 'Nakhon Si Thammarat'),
  ('นครสวรรค์', 'Nakhon Sawan'),
  ('นนทบุรี', 'Nonthaburi'),
  ('นราธิวาส', 'Narathiwat'),
  ('น่าน', 'Nan'),
  ('บึงกาฬ', 'Bueng Kan'),
  ('บุรีรัมย์', 'Buriram'),
  ('ปทุมธานี', 'Pathum Thani'),
  ('ประจวบคีรีขันธ์', 'Prachuap Khiri Khan'),
  ('ปราจีนบุรี', 'Prachinburi'),
  ('ปัตตานี', 'Pattani'),
  ('พระนครศรีอยุธยา', 'Phra Nakhon Si Ayutthaya'),
  ('พังงา', 'Phang Nga'),
  ('พัทลุง', 'Phatthalung'),
  ('พิจิตร', 'Phichit'),
  ('พิษณุโลก', 'Phitsanulok'),
  ('เพชรบุรี', 'Phetchaburi'),
  ('เพชรบูรณ์', 'Phetchabun'),
  ('แพร่', 'Phrae'),
  ('พะเยา', 'Phayao'),
  ('มหาสารคาม', 'Maha Sarakham'),
  ('มุกดาหาร', 'Mukdahan'),
  ('แม่ฮ่องสอน', 'Mae Hong Son'),
  ('ยโสธร', 'Yasothon'),
  ('ยะลา', 'Yala'),
  ('ร้อยเอ็ด', 'Roi Et'),
  ('ระนอง', 'Ranong'),
  ('ระยอง', 'Rayong'),
  ('ราชบุรี', 'Ratchaburi'),
  ('ลพบุรี', 'Lopburi'),
  ('ลำปาง', 'Lampang'),
  ('ลำพูน', 'Lamphun'),
  ('เลย', 'Loei'),
  ('ศรีสะเกษ', 'Sisaket'),
  ('สกลนคร', 'Sakon Nakhon'),
  ('สงขลา', 'Songkhla'),
  ('สตูล', 'Satun'),
  ('สมุทรปราการ', 'Samut Prakan'),
  ('สมุทรสงคราม', 'Samut Songkhram'),
  ('สมุทรสาคร', 'Samut Sakhon'),
  ('สระแก้ว', 'Sa Kaeo'),
  ('สระบุรี', 'Saraburi'),
  ('สิงห์บุรี', 'Sing Buri'),
  ('สุโขทัย', 'Sukhothai'),
  ('สุพรรณบุรี', 'Suphan Buri'),
  ('สุราษฎร์ธานี', 'Surat Thani'),
  ('สุรินทร์', 'Surin'),
  ('หนองคาย', 'Nong Khai'),
  ('หนองบัวลำภู', 'Nong Bua Lamphu'),
  ('อ่างทอง', 'Ang Thong'),
  ('อำนาจเจริญ', 'Amnat Charoen'),
  ('อุดรธานี', 'Udon Thani'),
  ('อุตรดิตถ์', 'Uttaradit'),
  ('อุทัยธานี', 'Uthai Thani'),
  ('อุบลราชธานี', 'Ubon Ratchathani');

INSERT INTO weather_logs
  (province_id, temperature, humidity, wind_speed, condition, condition_en, icon, updated_at)
VALUES
  (1, 34, 64, 25, 'แดดจัด',       'Sunny',         '☀️',  '2026-04-17 10:00:00.000'),
  (2, 28, 72, 15, 'มีเมฆบางส่วน', 'Partly Cloudy', '⛅',  '2026-04-17 10:00:00.000'),
  (3, 33, 80, 30, 'ฝนตกเล็กน้อย', 'Light Rain',    '🌧️', '2026-04-17 10:00:00.000'),
  (4, 36, 55, 10, 'ร้อนจัด',      'Very Hot',      '🌡️', '2026-04-17 10:00:00.000'),
  (5, 32, 75, 20, 'มีเมฆมาก',     'Cloudy',        '☁️',  '2026-04-17 10:00:00.000'),
  (6, 32, 61, 10, 'แดดจัด', 'Sunny', '☀️', '2026-04-19 09:00:00.000'),
  (7, 35, 68, 15, 'มีเมฆบางส่วน', 'Partly Cloudy', '⛅', '2026-04-19 09:00:00.000'),
  (8, 26, 75, 20, 'ฝนตกเล็กน้อย', 'Light Rain', '🌧️', '2026-04-19 09:00:00.000'),
  (9, 29, 82, 25, 'ร้อนจัด', 'Very Hot', '🌡️', '2026-04-19 09:00:00.000'),
  (10, 32, 89, 30, 'มีเมฆมาก', 'Cloudy', '☁️', '2026-04-19 09:00:00.000'),
  (11, 35, 60, 35, 'แดดจัด', 'Sunny', '☀️', '2026-04-19 09:00:00.000'),
  (12, 26, 67, 12, 'มีเมฆบางส่วน', 'Partly Cloudy', '⛅', '2026-04-19 09:00:00.000'),
  (13, 29, 74, 17, 'ฝนตกเล็กน้อย', 'Light Rain', '🌧️', '2026-04-19 09:00:00.000'),
  (14, 32, 81, 22, 'ร้อนจัด', 'Very Hot', '🌡️', '2026-04-19 09:00:00.000'),
  (15, 35, 88, 27, 'มีเมฆมาก', 'Cloudy', '☁️', '2026-04-19 09:00:00.000'),
  (16, 26, 59, 32, 'แดดจัด', 'Sunny', '☀️', '2026-04-19 09:00:00.000'),
  (17, 29, 66, 9, 'มีเมฆบางส่วน', 'Partly Cloudy', '⛅', '2026-04-19 09:00:00.000'),
  (18, 32, 73, 14, 'ฝนตกเล็กน้อย', 'Light Rain', '🌧️', '2026-04-19 09:00:00.000'),
  (19, 35, 80, 19, 'ร้อนจัด', 'Very Hot', '🌡️', '2026-04-19 09:00:00.000'),
  (20, 26, 87, 24, 'มีเมฆมาก', 'Cloudy', '☁️', '2026-04-19 09:00:00.000'),
  (21, 29, 58, 29, 'แดดจัด', 'Sunny', '☀️', '2026-04-19 09:00:00.000'),
  (22, 32, 65, 34, 'มีเมฆบางส่วน', 'Partly Cloudy', '⛅', '2026-04-19 09:00:00.000'),
  (23, 35, 72, 11, 'ฝนตกเล็กน้อย', 'Light Rain', '🌧️', '2026-04-19 09:00:00.000'),
  (24, 26, 79, 16, 'ร้อนจัด', 'Very Hot', '🌡️', '2026-04-19 09:00:00.000'),
  (25, 29, 86, 21, 'มีเมฆมาก', 'Cloudy', '☁️', '2026-04-19 09:00:00.000'),
  (26, 32, 57, 26, 'แดดจัด', 'Sunny', '☀️', '2026-04-19 09:00:00.000'),
  (27, 35, 64, 31, 'มีเมฆบางส่วน', 'Partly Cloudy', '⛅', '2026-04-19 09:00:00.000'),
  (28, 26, 71, 8, 'ฝนตกเล็กน้อย', 'Light Rain', '🌧️', '2026-04-19 09:00:00.000'),
  (29, 29, 78, 13, 'ร้อนจัด', 'Very Hot', '🌡️', '2026-04-19 09:00:00.000'),
  (30, 32, 85, 18, 'มีเมฆมาก', 'Cloudy', '☁️', '2026-04-19 09:00:00.000'),
  (31, 35, 56, 23, 'แดดจัด', 'Sunny', '☀️', '2026-04-19 09:00:00.000'),
  (32, 26, 63, 28, 'มีเมฆบางส่วน', 'Partly Cloudy', '⛅', '2026-04-19 09:00:00.000'),
  (33, 29, 70, 33, 'ฝนตกเล็กน้อย', 'Light Rain', '🌧️', '2026-04-19 09:00:00.000'),
  (34, 32, 77, 10, 'ร้อนจัด', 'Very Hot', '🌡️', '2026-04-19 09:00:00.000'),
  (35, 35, 84, 15, 'มีเมฆมาก', 'Cloudy', '☁️', '2026-04-19 09:00:00.000'),
  (36, 26, 55, 20, 'แดดจัด', 'Sunny', '☀️', '2026-04-19 09:00:00.000'),
  (37, 29, 62, 25, 'มีเมฆบางส่วน', 'Partly Cloudy', '⛅', '2026-04-19 09:00:00.000'),
  (38, 32, 69, 30, 'ฝนตกเล็กน้อย', 'Light Rain', '🌧️', '2026-04-19 09:00:00.000'),
  (39, 35, 76, 35, 'ร้อนจัด', 'Very Hot', '🌡️', '2026-04-19 09:00:00.000'),
  (40, 26, 83, 12, 'มีเมฆมาก', 'Cloudy', '☁️', '2026-04-19 09:00:00.000'),
  (41, 29, 90, 17, 'แดดจัด', 'Sunny', '☀️', '2026-04-19 09:00:00.000'),
  (42, 32, 61, 22, 'มีเมฆบางส่วน', 'Partly Cloudy', '⛅', '2026-04-19 09:00:00.000'),
  (43, 35, 68, 27, 'ฝนตกเล็กน้อย', 'Light Rain', '🌧️', '2026-04-19 09:00:00.000'),
  (44, 26, 75, 32, 'ร้อนจัด', 'Very Hot', '🌡️', '2026-04-19 09:00:00.000'),
  (45, 29, 82, 9, 'มีเมฆมาก', 'Cloudy', '☁️', '2026-04-19 09:00:00.000'),
  (46, 32, 89, 14, 'แดดจัด', 'Sunny', '☀️', '2026-04-19 09:00:00.000'),
  (47, 35, 60, 19, 'มีเมฆบางส่วน', 'Partly Cloudy', '⛅', '2026-04-19 09:00:00.000'),
  (48, 26, 67, 24, 'ฝนตกเล็กน้อย', 'Light Rain', '🌧️', '2026-04-19 09:00:00.000'),
  (49, 29, 74, 29, 'ร้อนจัด', 'Very Hot', '🌡️', '2026-04-19 09:00:00.000'),
  (50, 32, 81, 34, 'มีเมฆมาก', 'Cloudy', '☁️', '2026-04-19 09:00:00.000'),
  (51, 35, 88, 11, 'แดดจัด', 'Sunny', '☀️', '2026-04-19 09:00:00.000'),
  (52, 26, 59, 16, 'มีเมฆบางส่วน', 'Partly Cloudy', '⛅', '2026-04-19 09:00:00.000'),
  (53, 29, 66, 21, 'ฝนตกเล็กน้อย', 'Light Rain', '🌧️', '2026-04-19 09:00:00.000'),
  (54, 32, 73, 26, 'ร้อนจัด', 'Very Hot', '🌡️', '2026-04-19 09:00:00.000'),
  (55, 35, 80, 31, 'มีเมฆมาก', 'Cloudy', '☁️', '2026-04-19 09:00:00.000'),
  (56, 26, 87, 8, 'แดดจัด', 'Sunny', '☀️', '2026-04-19 09:00:00.000'),
  (57, 29, 58, 13, 'มีเมฆบางส่วน', 'Partly Cloudy', '⛅', '2026-04-19 09:00:00.000'),
  (58, 32, 65, 18, 'ฝนตกเล็กน้อย', 'Light Rain', '🌧️', '2026-04-19 09:00:00.000'),
  (59, 35, 72, 23, 'ร้อนจัด', 'Very Hot', '🌡️', '2026-04-19 09:00:00.000'),
  (60, 26, 79, 28, 'มีเมฆมาก', 'Cloudy', '☁️', '2026-04-19 09:00:00.000'),
  (61, 29, 86, 33, 'แดดจัด', 'Sunny', '☀️', '2026-04-19 09:00:00.000'),
  (62, 32, 57, 10, 'มีเมฆบางส่วน', 'Partly Cloudy', '⛅', '2026-04-19 09:00:00.000'),
  (63, 35, 64, 15, 'ฝนตกเล็กน้อย', 'Light Rain', '🌧️', '2026-04-19 09:00:00.000'),
  (64, 26, 71, 20, 'ร้อนจัด', 'Very Hot', '🌡️', '2026-04-19 09:00:00.000'),
  (65, 29, 78, 25, 'มีเมฆมาก', 'Cloudy', '☁️', '2026-04-19 09:00:00.000'),
  (66, 32, 85, 30, 'แดดจัด', 'Sunny', '☀️', '2026-04-19 09:00:00.000'),
  (67, 35, 56, 35, 'มีเมฆบางส่วน', 'Partly Cloudy', '⛅', '2026-04-19 09:00:00.000'),
  (68, 26, 63, 12, 'ฝนตกเล็กน้อย', 'Light Rain', '🌧️', '2026-04-19 09:00:00.000'),
  (69, 29, 70, 17, 'ร้อนจัด', 'Very Hot', '🌡️', '2026-04-19 09:00:00.000'),
  (70, 32, 77, 22, 'มีเมฆมาก', 'Cloudy', '☁️', '2026-04-19 09:00:00.000'),
  (71, 35, 84, 27, 'แดดจัด', 'Sunny', '☀️', '2026-04-19 09:00:00.000'),
  (72, 26, 55, 32, 'มีเมฆบางส่วน', 'Partly Cloudy', '⛅', '2026-04-19 09:00:00.000'),
  (73, 29, 62, 9, 'ฝนตกเล็กน้อย', 'Light Rain', '🌧️', '2026-04-19 09:00:00.000'),
  (74, 32, 69, 14, 'ร้อนจัด', 'Very Hot', '🌡️', '2026-04-19 09:00:00.000'),
  (75, 35, 76, 19, 'มีเมฆมาก', 'Cloudy', '☁️', '2026-04-19 09:00:00.000'),
  (76, 26, 83, 24, 'แดดจัด', 'Sunny', '☀️', '2026-04-19 09:00:00.000'),
  (77, 29, 90, 29, 'มีเมฆบางส่วน', 'Partly Cloudy', '⛅', '2026-04-19 09:00:00.000');

CREATE TABLE IF NOT EXISTS public.plan (
  id SERIAL PRIMARY KEY,
  plan_name VARCHAR(20) NOT NULL UNIQUE,
  req_per_minute INT NOT NULL DEFAULT 10,
  req_per_day INT NOT NULL DEFAULT 100,
  req_per_month INT NOT NULL DEFAULT 1000,
  price INT DEFAULT 0,
  has_usage_dashboard BOOLEAN DEFAULT true,
  has_data_export BOOLEAN DEFAULT false,
  sla_guarantee VARCHAR(50) DEFAULT 'None',
  support_level VARCHAR(50) DEFAULT 'Community',
  is_active BOOLEAN DEFAULT true  
);

INSERT INTO public.plan (plan_name, req_per_minute, req_per_day, req_per_month, price, has_data_export, sla_guarantee, support_level) 
VALUES 
('free', 5, 10, 1000, 0, false, 'None', 'Community'),
('pro', 60, 1000, 30000, 299, true, '99.5%', 'Email (24hr)'),
('enterprise', 120, 5000, 100000, 999, true, '99.9%', 'Priority 24/7');