CREATE TABLE person (
  id SERIAL PRIMARY KEY,
  name VARCHAR
);

--Import Data From Countries Folder at public/countries_data--
CREATE TABLE countries (
  id SERIAL PRIMARY KEY,
  country_code CHAR(2) UNIQUE,
  country_name VARCHAR(50) UNIQUE
);

CREATE TABLE family_visited (
  id INT REFERENCES person(id),
  country_code CHAR(2) REFERENCES countries(country_code),
  PRIMARY_KEY (id,country_code)
)