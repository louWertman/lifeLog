/*
Authors: Lou Wertman,
Purpose: Store the entry and mood objects 
*/


export class Entry {

    public date: string;
    public mood: string;
    public habits: Habit[]; // Assuming Habit is defined elsewhere
    public textEntry: string;

    public constructor(date: string, mood: string, habits: Habit[], textEntry: string) {
        this.date = date;
        this.mood = mood;
        this.habits = habits;
        this.textEntry = textEntry;
    }
    //Getters
    getMoods() {
        return this.mood;
    }

    getHabits() {
        return this.habits;
    }

    getTextEntry() {
        return this.textEntry;
    }

    getDateEntry() {
        return this.date;
    }

    //Helpers
    private noDelim(text: string) {
        if (text.includes("@~~@DELIM@~~@")) {
            document.write("ERROR: Use of Delimeter in Text Feild")
            return false;
        }
        else {
            return true;
        }
    }

    //Setters
    setMoods(moodInput: string) {
        if (this.noDelim(moodInput.toString())) {
            this.mood = moodInput;
        }
    }

    setHabits(habitsInput: Array<Habit>) {
        this.habits = habitsInput;
    }

    setTextEntry(inputText: string) {
        if (this.noDelim(inputText)) {
            this.textEntry = inputText;
        }
    }
}

export class Habit {
    public constructor(public name: string, public positive: boolean, public active: boolean) {
        if (this.noDelim(name)) {
            this.name = name;
            this.positive = positive;
            this.active = active;
        }
        else{
            document.write("Error: use of DELIM")
        }
    }

    setActive() {
        this.active = true;
    }

    setDormant() {
        this.active = false;
    }

    setPositive() {
        this.positive = true
    }

    setNegative() {
        this.positive = false;
    }

    //returns a string array of information 
    //[0] - name, [1] - active or dormant, [2] positive or negative
    getStatus() {
        let statusObj: string[] = [];
        statusObj[0] = this.name;
        if (this.active == true) {
            statusObj[1] == 'Active';
        } else {
            statusObj[1] == 'Dormant';
        }
        if (this.positive == true) {
            statusObj[2] == 'Positive';
        } else {
            statusObj[2] == 'Negative';
        }
        return statusObj;
    }


    private noDelim(text: string) {
        if (text.includes(",") || text.includes("@~~@DELIM@~~@") || text.includes(":")) {
            document.write("ERROR: Use of Delimeter in Text Feild")
            return false;
        }
        else {
            return true;
        }
    }
}
