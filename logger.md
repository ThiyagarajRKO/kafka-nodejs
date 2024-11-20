`Tables`

-- Table for requests
CREATE TABLE requests (
id SERIAL PRIMARY KEY,
request_id UUID NOT NULL UNIQUE, -- Unique ID for each request
method VARCHAR(10) NOT NULL, -- HTTP method (GET, POST, etc.)
url TEXT NOT NULL, -- Requested URL
input JSONB, -- Step-specific details
created_at TIMESTAMP DEFAULT NOW(), -- Request timestamp
status_code INT -- Final HTTP status code
);

-- Table for request steps with a foreign key to requests table
CREATE TABLE request_steps (
id SERIAL PRIMARY KEY,
request_id UUID NOT NULL, -- Foreign key to requests table
log_type VARCHAR(10) NOT NULL,
step_name TEXT NOT NULL, -- Name or description of the step
error_message TEXT,
input JSONB, -- Step-specific details
output JSONB, -- Step-specific details
created_at TIMESTAMP DEFAULT NOW(), -- Step timestamp
FOREIGN KEY (request_id) REFERENCES requests (request_id) ON DELETE CASCADE
);
