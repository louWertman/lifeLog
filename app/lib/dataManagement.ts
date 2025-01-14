/*
Authors: Lou Wertman,
Purpose: Functions related to syncing to the local file or the database and any entry retrieval functions
*/

class syncToDB {
    public constructor(public syncToken: string){
        this.syncToken = syncToken;
    }
    //functions for sycning to DB
}

class syncToFile {
    public constructor(public file: string){
        this.file = file;
    }

    listEntries(){
        ;
    }

    fetchEntry(date: string){
        ;
    }

    writeEntryToFile(entry:Entry){
        ;
    }
}