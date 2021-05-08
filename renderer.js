$(document).ready(function() {

    //Initializing all global variables
    //globals object will be frozen
    const globals = {
        frameNumber:"",
        policy:""
    }
    let cacheArray;
    let job;
    let jobCounter = 0;
    let hit = 0;
    let jobQueue = [];
    let jobLog = [];
    let hitPercentage;
    let missPercentage;
    let modifiedPos;
    let lruMap = new Map();

    //on event click for the add button will run this code
    $('#addBtn').click((e)=> {
        e.preventDefault();
         //assign globals
        if(globals.frameNumber ==""){
            globals.frameNumber = parseInt($("#frameNumbers").val());
            globals.policy = $('#policy').val();
            Object.freeze(globals);
        }//assign starting cache array
        if (cacheArray == null){
            cacheArray = new Array(globals.frameNumber);
            for (let i = 0; i < globals.frameNumber;i++){
                cacheArray[i] = [];
                cacheArray[i][0]='null';
            }
        }
        job = $("#inputJob").val();
        if(job == ""){
            //will do nothing. User must label job.
        }else{
            jobLog.push(job);
            if(globals.policy =="FIFO"){
                jobCounter++;
                insertFIFO();
                updateTable();
                updatePercentages();
            }else{
                jobCounter++;
                insertLRU();
                updateTable();
                updatePercentages();
            }
        }
    });

    //On click of reset button will reload application
    $('#resetBtn').click((e)=>{
        window.location.reload();
    });

    //computes and displays the new percentages
    function updatePercentages(){
        hitPercentage = Math.round(hit/jobCounter *10000)/100;
        missPercentage = Math.round((1-(hitPercentage/100))*10000)/100;
        $("#hitPercentage").html(`Hit = ${hitPercentage}%`)
        $("#missPercentage").html(`Miss = ${missPercentage}%`)
    }

    function insertFIFO() {
        let inserted = false;
        //copy last column to current column
        cacheArray.forEach(e => {
            e.push(e[jobCounter - 1]);
        });
        //searches if job is already in cache
        cacheArray.forEach(e => {
            if (e[jobCounter] == job) {
                inserted = true;
                hit++;
            }
        });
        //Searches for free space in cache
        if (!inserted) {
            for (let i = 0; i < cacheArray.length; i++) {
                if (cacheArray[i][jobCounter] == "null" && !inserted) {
                    cacheArray[i][jobCounter] = job;
                    inserted = true;
                    modifiedPos = [i, jobCounter];
                    jobQueue.push(job);
                }
            }
        }
        //There is no free space in cache, must remove FIFO
        if (!inserted) {
            //removes and stores value from head of jobQueue
            let firstIn = jobQueue.shift();
            for (let j = 0; j < cacheArray.length; j++) {
                if (cacheArray[j][jobCounter] == firstIn && !inserted) {
                    inserted = true;
                    cacheArray[j][jobCounter] = job;
                    modifiedPos = [j, jobCounter];
                    jobQueue.push(job);
                }
            }
        }
    }

    //Increments the value of jobs that are still in the cache memory
    function incrementLRU(){
        for (let [key, value] of lruMap) {
            lruMap.set(key,value + 1);
        }
    }

    function insertLRU(){
        let inserted = false;
        //copy last column to current column
        cacheArray.forEach(e => {
            e.push(e[jobCounter - 1]);
        });
        //searches if job is already in cache
        cacheArray.forEach(e => {
            if (e[jobCounter] == job) {
                incrementLRU();
                lruMap.set(job,0);
                inserted = true;
                hit++;
            }
        });
        //Searches for free space in cache
        if (!inserted) {
            for (let i = 0; i < cacheArray.length; i++) {
                if (cacheArray[i][jobCounter] == "null" && !inserted) {
                    cacheArray[i][jobCounter] = job;
                    inserted = true;
                    modifiedPos = [i, jobCounter];
                    jobQueue.push(job);
                    incrementLRU();
                    lruMap.set(job,0);
                }
            }
        }
        //There is no free space in cache, must remove LFU
        if (!inserted) {
            let maxKey;
            let maxValue =-1;
            //loops through lruMap returning key value pairs
            //finds key with maxValue, finds LFU job
            for (let [key, value] of lruMap) {
                if(value > maxValue){
                    maxKey = key;
                    maxValue = value;
                }
            }
            //replaces old job in cache array with new job
                for (let j = 0; j < cacheArray.length; j++) {
                    if(cacheArray[j][jobCounter] == maxKey && !inserted) {
                        inserted = true;
                        cacheArray[j][jobCounter] = job;
                        lruMap.delete(maxKey);
                        modifiedPos = [j, jobCounter];
                        incrementLRU();
                        lruMap.set(job,0);
                    }
                }
            }
        }

    //manipulates html to display cache array and most recent modified cell
    function updateTable(){
        //creates and populates table head
        $("#cacheTable").html("<thead></thead><tbody></tbody>");
        $("#cacheTable").children('thead').append("<tr></tr>");
        $("#cacheTable").children('thead').children('tr').append("<th>Start</th>");
        jobLog.forEach(e =>{
            $("#cacheTable").children('thead').children('tr').append('<th>' + e + '</th>');
        });
        //creates and populates table body
        for(let i =0; i < cacheArray.length; i++){
            $("#cacheTable").children('tbody').append("<tr></tr>");
            for(let j = 0; j < cacheArray[i].length; j++){
                if(i == modifiedPos[0] && j ==modifiedPos[1]){
                    $("#cacheTable > tbody > :last" ).append("<td style='color: red; font-weight:bold '>"+ cacheArray[i][j] +"</td>");
                }else{
                    $("#cacheTable > tbody > :last" ).append("<td>"+ cacheArray[i][j] +"</td>");
                }
            }
        }
    }
});