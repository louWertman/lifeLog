/*
Authors: Lou Wertman,
Purpose: Functions related to syncing to the local file or the database and any entry retrieval functions
*/

import papaparse from "papaparse";
import * as fs from 'fs';

class syncToDB {
    public constructor(public syncToken: string){
        this.syncToken = syncToken;
    }
    //functions for sycning to DB
}

class syncToFile {
    //constructor
    public constructor(public filePath: string){
        this.filePath = filePath;
    }

    //variables
    private entryLog = this.loadFile(this.filePath);

    //functions

    //load and parse a file for the entryLog object
    loadFile(filePath: string){
        //if file does not exist create it
        if(!fs.existsSync(filePath)){
            fs.writeFileSync(filePath, 'DATE@~~@DELIM@~~@MOOD @~~@DELIM@~~@HABIT@~~@DELIM@~~@ENTRY\n')
        }
        //open and parse file
        let file = fs.readFileSync(filePath, 'utf-8');
        let data = papaparse.parse(file, {
            delimiter: "@~~@DELIM@~~@",
            skipEmptyLines: true,
            header: true,
            error: (error) => {
                document.write('Error parsing file: ', error);
            }
        });
        // data with multiple values such as mood and habits need to manually parsed later as they are seperate by comma values, for the time being they are stored as strings
        let entryLog = data.data as {
            date: string, mood: string, habits: string, entry: string
        }[];
        return entryLog;
    }

    //returns a string array with the date of every entry
    listEntries(){
        let dates = this.entryLog.map((row) => row.date);
        return dates;
    }
    //finds an entry with a date, returns an Entry object
    fetchEntry(date: string){
        ;
    }

    //writes an entyr to the file, NULL return
    writeEntryToFile(entry:Entry){
        ;
    }
}