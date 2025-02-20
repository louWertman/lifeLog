/*
Authors: Lou Wertman,
Purpose: Store the entry and mood objects 
*/


class Entry {
    public constructor (public date: string) {
        this.date = date;
    }

    private moods: Array<string>;
    private habits: Array<Habit>;
    private textEntry: string;

    //Getters
    getMoods(){
        return this.moods;
    }

    getHabits(){
        return this.habits;
    }

    getTextEntry(){
        return this.textEntry;
    }

    //Helpers
    private noDelim(text:string){
        if(text.includes("@~~@DELIM@~~@")){
            document.write("ERROR: Use of Delimeter in Text Feild")
            return false;
        }
        else{
            return true;
        }
    }

    //Setters
    setMoods(moodsInput: Array<string>){
        if(this.noDelim(moodsInput.toString())){
            this.moods = moodsInput;
        }
    }

    setHabits(habitsInput: Array<Habit>){
        this.habits = habitsInput;
    }

    setTextEntry(inputText: string){
        if(this.noDelim(inputText)){
            this.textEntry = inputText;
        }
    }
}

class Habit {
    public constructor (public name: string){
        if(this.noDelim(name)){
            this.name = name;
        }else{
            document.write('error: DELIMTER');
        }
    }

    private active = true;
    private positive = true;

    setActive(){
        this.active = true;
    }

    setDormant(){
        this.active = false;
    }

    setPositive(){
        this.positive = true
    }

    setNegative(){
        this.positive = false; 
    }

    //returns a string array of information 
    //[0] - name, [1] - active or dormant, [2] positive or negative
    getStatus(){
        let statusObj: Array<string>;
        statusObj[0] = this.name;
        if (this.active == true){
            statusObj[1] == 'Active';
        }else{
            statusObj[1] == 'Dormant';
        }
        if (this.positive== true){
            statusObj[2] == 'Positive';
        }else{
            statusObj[2] == 'Negative';
        }
        return statusObj;
    }

    private noDelim(text:string){
        if(text.includes("@~~@DELIM@~~@")){
            document.write("ERROR: Use of Delimeter in Text Feild")
            return false;
        }
        else{
            return true;
        }
    }


}