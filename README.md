This application is to provide insight into how trading works by providing numeric values for Commodity Derivatives so that the user can see the value. This application makes use of Data.

This project makes use of every layer of development. The application contains a front-end, a Python backend and a secure data layer. This application aims to help the user see how trading works by making use of data.

**[Current Status]**

This is a test application that makes use of the data. It is not intended to be used for real trading. There will be no trading tips or financial advice.

**Overview**

The application makes use of Data from the commodity market and displays this data onto the website. This can be used to help understand some of the strategies and how successful they have been.

**Features**

**Historical Analytics** - Insight into the results and records made.

**Analyse** - Analyse the numeric data to find out how successful the strategy was.

**Visualise** - Using visualisations to see how much money have been made over the period with markers for each trade.

**Scanner data** - Use scanner data to further aid with analysis.

**REST API** - API connects the end of the website to the backend to retrieve data and perform calculations.

**Database** - Using SQLAlchemy to store and manage the data. By default using SQLite but the option is there to use Postgresql.

**Migrations** - Migrate the data using alembic.

**Testing** - Contains testing to ensure the changes made to the API and DB work as indented.

**Tech Stack**

Layer Tech

Front End React, Vite, JavaScript

Back End Python FastAPI

Database SQLite, PostgreSQL (Can be change)

ORM SQLAlchemy

Migrations Alembic

API Docs FastAPI / OpenAPI

Data Types JSON, CSV

**Project Structure**

swarnadrishti-intelligence/

backend/

api.py

calculations.py

importer.py

requirements.txt

db/

alembic/

data/

docs/

API_REFERENCE.md

DATABASE_SCHEMA.md

IMPLEMENTATION_AUDIT.md

PROJECT_CONTEXT.md

RUNBOOK.md

TEST_REPORT.md

public/

src/

.env.example

.gitignore

index.html

package.json

README.md

**Getting Started**

**Requirements**

Ensure you have the following installed:

Node.js and npm

Python 3.x

Git

**1. Clone the Repo**

git clone https://github.com/mohdmubeen3/swarnadrishti-intelligence.git

cd swarnadrishti-intelligence

**2. Front End**

Navigate to the folder. Inside run:

npm install

npm run dev

This will open the website in your terminal.

**3. Back End**

Open a terminal into the project folder.

Create a virtual environment:

python -m venv.venv

Activate it:

(For Windows Powershell)

.\.venv\Scripts\Activate.ps1

(For Mac OS/Linux)

source.venv/bin/activate

Install the tools then run:

python -m pip install -r backend/requirements.txt

Now run the backend:

python -m uvicorn api:app --reload --appdir backend

You can now see the backend at:

http://localhost:8000/api (API)

http://localhost:8000/docs (Online help for API)

Further information on setting up the database can be found in docs/RUNBOOK.md.

**Testing**

The project contains some testing for the backend, API and DB.

Install the tools for the backend and run:

python -m pytest backend

There is also a test in the root of the project.

python smoke_test.py

The results and known information can be found in docs/TEST_REPORT.md.

**Documentation**

All detailed information can be found in the docs/ folder.

**Document Information**

**API Reference** Information about the endpoint and what the API does.

**Database Schema** Information about how the data has been stored and the models used.

**Implementation Audit** What has been included/excluded from this project.

**Project Context** What this project is trying to achieve and how it works.

**Runbook** How this project can be setup.

**Test Report** What has been done and the results.

**Current Scope and Limitations**

Analysis is done using data from this application.

No real time data or trading support is available.

The API does work with the current data, see the API reference and audit for more information.

Just because it works locally does not mean it is ready for production.

No advice is given.

**Potential Improvements**

Real time and accurate data should be available.

Tools should be provided to analyse the data to see how successful the strategy was.

Better visualisations and comparison tools.

Automated to set up.

Ready for use with monitoring and security tools.

**Contributions**

Everyone is welcome to contribute. If there are any issues please suggest any improvements. Be sure to give details for the issue, what would be expected and any test results.