# lifeLog

This is a journaling application built for speed and simplicity. We built the application around CBT (Cognitive Behavioral Therapy) principles, or the idea that your thoughts, feelings, and behaviors are connected and influence each other. We are DDLL (Dyllan, David, Lou, Luis), a team that built this application for our Capstone project (CPSC354 FALL2024, CPSC355 SPRING2025) for Kutztown University of Pennsylvania. 

We built this tool around simplicity and control over your data. Many journaling applications on the market are overly complex OR missing key features such as syncing. Additionally we are privacy focused and believe your data is yours, particularly if it contains sensitive information. All information on the database is encrypted and stored locally. You can also sync your data to a remote database using the key above. That choice is up to you. No statistics processing takes place on our servers, all processing is client side.

> Refer to __DOCUMENTATION/ for documentation related needs

*Disclaimer: We are not licensed professionals, we believe this tool can provide insight but this is not a replacement for professional help.*

# LifeLog Development Set Up

## Documentation of Libraries and Tools Used:
- [ReactJS](https://react.dev/) : JS Framework
- [NextJS](https://nextjs.org/) : Allows us to create a static output for deployment
- [Capacitor](https://capacitorjs.com/) : For making the application cross platform and handling the filesystem
- [Papaparse](https://www.papaparse.com/) : For parsing the CSV files
- [Recharts](https://recharts.org/en-US) : used for the charts and graphs in statistics
- [Azure](https://learn.microsoft.com/en-us/azure/?product=popular) : For the Database
- [Firebase](https://firebase.google.com/docs/) : For Website Hosting
- [Git](https://git-scm.com/downloads) : Version management, hosted on GitHub

## Installation Steps
Install Pnpm, which was our package manager of choice
```sh
npm install -g pnpm
```
Install the project from the root directory
```sh
pnpm install
```

Common Commands:
```sh
pnpm run dev # open up real time dev server
pnpm build # creates a static page in the .export folder for deployment
```

Check the Deployment Document for Deployment Instructions for different Targets.

