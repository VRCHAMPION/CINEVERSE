-- ================================================
-- CineVerse Database Schema
-- PostgreSQL
-- IMDB Dataset
-- ================================================


-- ================================================
-- STEP 1 - CREATE TABLES
-- ================================================

CREATE TABLE Titles (
    tconst VARCHAR(15) PRIMARY KEY,
    titleType VARCHAR(20),
    primaryTitle VARCHAR(255),
    originalTitle VARCHAR(255),
    startYear INT,
    endYear INT,
    runtimeMinutes INT,
    isAdult INT,
    genre VARCHAR(255)
);

CREATE TABLE Names (
    nconst VARCHAR(15) PRIMARY KEY,
    primaryName VARCHAR(255),
    birthYear INT,
    deathYear INT,
    primaryProfession VARCHAR(255)
);

CREATE TABLE Ratings (
    tconst VARCHAR(15) PRIMARY KEY,
    averageRating FLOAT,
    numVotes INT,
    FOREIGN KEY (tconst) REFERENCES Titles(tconst)
);

CREATE TABLE Principals (
    tconst VARCHAR(15),
    nconst VARCHAR(15),
    ordering INT,
    category VARCHAR(50),
    job VARCHAR(255),
    characters VARCHAR(255),
    PRIMARY KEY (tconst, nconst, ordering),
    FOREIGN KEY (tconst) REFERENCES Titles(tconst),
    FOREIGN KEY (nconst) REFERENCES Names(nconst)
);

CREATE TABLE Aliases (
    titleId VARCHAR(15),
    ordering INT,
    title VARCHAR(255),
    region VARCHAR(10),
    language VARCHAR(10),
    isOriginalTitle BOOLEAN,
    PRIMARY KEY (titleId, ordering),
    FOREIGN KEY (titleId) REFERENCES Titles(tconst)
);

CREATE TABLE Episodes (
    tconst VARCHAR(15) PRIMARY KEY,
    parentTconst VARCHAR(15),
    seasonNumber INT,
    episodeNumber INT,
    FOREIGN KEY (parentTconst) REFERENCES Titles(tconst),
    FOREIGN KEY (tconst) REFERENCES Titles(tconst)
);


-- ================================================
-- STEP 2 - ALTER TABLES (fixes and additions)
-- ================================================

ALTER TABLE Titles
ALTER COLUMN primaryTitle TYPE TEXT;

ALTER TABLE Titles
ALTER COLUMN originalTitle TYPE TEXT;

ALTER TABLE Titles
ALTER COLUMN genre TYPE TEXT;

ALTER TABLE Names
ADD COLUMN knownForTitles TEXT;

ALTER TABLE Principals
ALTER COLUMN job TYPE TEXT;

ALTER TABLE Principals
ALTER COLUMN characters TYPE TEXT;

ALTER TABLE Principals DROP CONSTRAINT principals_nconst_fkey;

ALTER TABLE Episodes
ALTER COLUMN seasonNumber DROP NOT NULL;

ALTER TABLE Episodes
ALTER COLUMN episodeNumber DROP NOT NULL;

ALTER TABLE Aliases
ADD COLUMN types TEXT;

ALTER TABLE Aliases
ADD COLUMN attributes TEXT;

ALTER TABLE Aliases
ALTER COLUMN title TYPE TEXT;


-- ================================================
-- STEP 3 - IMPORT DATA FROM IMDB TSV FILES
-- Download datasets from: https://datasets.imdbws.com/
-- Update the file paths below to match your system
-- ================================================

-- Import Titles (title.basics.tsv)
COPY Titles(
    tconst,
    titleType,
    primaryTitle,
    originalTitle,
    isAdult,
    startYear,
    endYear,
    runtimeMinutes,
    genre
)
FROM 'YOUR_PATH/title.basics.tsv'
WITH (
    FORMAT text,
    DELIMITER E'\t',
    NULL '\N',
    HEADER true
);

-- Import Names (name.basics.tsv)
COPY Names
FROM 'YOUR_PATH/name.basics.tsv'
WITH (
    FORMAT text,
    DELIMITER E'\t',
    NULL '\N',
    HEADER true
);

-- Import Ratings (title.ratings.tsv)
COPY Ratings
FROM 'YOUR_PATH/title.ratings.tsv'
WITH (
    FORMAT text,
    DELIMITER E'\t',
    NULL '\N',
    HEADER true
);

-- Import Principals (title.principals.tsv)
COPY Principals(tconst, ordering, nconst, category, job, characters)
FROM 'YOUR_PATH/title.principals.tsv'
WITH (
    FORMAT text,
    DELIMITER E'\t',
    NULL '\N',
    HEADER true
);

-- Import Episodes (title.episode.tsv)
COPY Episodes(tconst, parentTconst, seasonNumber, episodeNumber)
FROM 'YOUR_PATH/title.episode.tsv'
WITH (
    FORMAT text,
    DELIMITER E'\t',
    NULL '\N',
    HEADER true
);

-- Import Aliases (title.akas.tsv)
COPY Aliases(titleId, ordering, title, region, language, types, attributes, isOriginalTitle)
FROM 'YOUR_PATH/title.akas.tsv'
WITH (
    FORMAT text,
    DELIMITER E'\t',
    NULL '\N',
    HEADER true
);


-- ================================================
-- STEP 4 - VERIFY DATA (run after import)
-- ================================================

SELECT COUNT(*) FROM Titles;
SELECT COUNT(*) FROM Names;
SELECT COUNT(*) FROM Principals;
SELECT COUNT(*) FROM Ratings;
SELECT COUNT(*) FROM Episodes;
SELECT COUNT(*) FROM Aliases;
