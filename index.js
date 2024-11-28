import axios from "axios";
import chalk from "chalk";
import chalkAnimation from 'chalk-animation';
import figlet from "figlet";
import { pastel } from "gradient-string";
import inquirer from "inquirer";
import { createSpinner } from "nanospinner";

let playerName;
let category;
let score = 0;

const sleep = (ms=2000)=> new Promise ((r)=>setTimeout(r,ms));

async function welcome() {
 const title = chalkAnimation.glitch("welcome to our quiz game \n");
  
 await sleep();
 title.stop();

 console.log(`
${chalk.bgBlue("HOW TO PLAY")} 
This is a ${chalk.magenta("quiz game")} where you start by entering your ${chalk.cyanBright("player name")} and selecting a ${chalk.yellowBright("category")}.\nYou'll face a series of ${chalk.blue("True")}/${chalk.red("False")} questions—answer quickly and correctly to test your knowledge and have fun!
    `)
}


async function askName() {
  const answers = await inquirer.prompt({
    name:'player_name',
    type:'input',
    message:'what is your name?',

    default(){
      return 'player';
    }
  })

  playerName = answers.player_name;
}

async function selectGameMode() {
  const gameCategory = await inquirer.prompt({
    name:`category`,
    type:'list',
    message: `What category of quiz you wanna play ${playerName}?\n`,
    choices:[
      'Flims',
      'Anime',
      'Games',
      'Music',
      'Hestory',
      'Geography',
      'General knowledge',
    ]
  });

  switch (gameCategory.category) {
    case 'Flims':
      category = 11;
      break;
    case 'Anime':
      category = 31;
      break;
    case 'Games':
      category = 15;
      break;
    case 'Music':
      category = 12;
      break;
    case 'Hestory':
      category = 23;
      break;
    case 'Geography':
      category = 22;
      break;
    case  'General knowledge':
      category = 9;
  };

  // console.log(gameCategory.category, category);
}


async function qustion() {
try {
    const spinner = createSpinner('fetching quizs...').start();
  
    const {data} = await axios.get(`https://opentdb.com/api.php?amount=10&category=${category}&difficulty=easy&type=boolean`);
    
    if(data.response_code==0){
      spinner.success("done fetching");
      
      // console.log(data);
      const quizList = data.results;

      for (let i = 0; i < quizList.length; i++) {
        //  console.clear();
        // console.log(quizList[i].question);
         let question = quizList[i].question;
        if(question?.includes("&quot;")){
          question = quizList[i].question.replace(/&quot;/g,'"'); 
        }

        if(question?.includes("&#039;")){
          question = quizList[i].question.replace(/&#039;/g,"'"); 
        }

        const answers = await inquirer.prompt({
          name:`quiz`,
          type:'list',
          message: `${question}\n`,
          choices:[
            'True',
            'False',
          ]
        });

         handleAnswer(answers.quiz == quizList[i].correct_answer);
      }
      // console.log(`The game ended and your total score is: ${score}!`);
    }else{
      spinner.error({text:"somthing went wrong while fetching data"});
    process.exit(1);
    }
} catch (error) {
  spinner.error({text:"somthing went wrong"});
  console.error(error);
  process.exit(1);
}
}

async function handleAnswer(isCorrect) {
  const spinner = createSpinner('cheaking answer...').start();
  // await sleep();

  if(isCorrect){
    spinner.success({text:`Correct answer\n`});
    return score++;
}else{
    spinner.error({text:`Wrong answer!\n`});
  }
}

async function gameOver() {
  console.clear();
  let msg;
  if(score >= 7){
    msg = `Excellent work ${playerName}!\n Your score is ${score}`;
  }else if(score >= 5){
    msg = `Well done ${playerName}!\n Your score is ${score}`;
  }else{
    msg = `Too bad, try again ${playerName}!\n Your score is ${score}`;
  }

  figlet(msg,(err,data)=>{
    console.log(pastel.multiline(data));
  });

}

console.clear();
await welcome();
await askName();
console.clear();
await selectGameMode();
console.log(`Let's start the game then ${playerName}!`);
// await sleep();
await qustion();
gameOver();