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