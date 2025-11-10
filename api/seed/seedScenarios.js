//C:\Users\n0502\OneDrive\שולחן העבודה\פרויקט סוף\final_project-main\final_project-main\api\seed\seedScenarios.js
require('dotenv').config();
const mongoose = require('mongoose');
const Scenario = require('../models/Scenario');

const DATA = [
  {
    scenarioId: "S1",
    title: "Extra-credit without proper citation",
    text: `David is a senior and only has three more classes this semester before he graduates. He feels the pressure to uphold his 3.65 GPA, as well as just wanting to finish and get the classes out of the way.
In one of his classes, an extra credit assignment is to read through a set of given texts from certain articles and books that have been given by the instructor throughout the semester, and then to compile personal thoughts based on the principles covered. To David, it seemed like basically doing something he already had done in the class—read the same information again. He figured the instructor just wanted to make sure the students really did read the articles, so David wrote his paper using direct quotes and verbatim phrases from the reading without correct citation. It was just extra credit, after all, so if it was not as good as his other work, it couldn't really hurt his grade.`,
    reflection: [
      "Is what David did wrong? Why or why not?",
      "Do you think David is right in thinking that this assignment really doesn't matter and can't really hurt his grade because it is only for extra credit?"
    ],
    selTags: ["Responsible Decision-Making","Self-Management","Self-Awareness","Social Awareness"],
    assignedGroupType: "experimental"
  },
  {
    scenarioId: "S3",
    title: "Dorm-mate wakes you up daily",
    text: `You live in a dorm with someone you did not meet until move-in day. His classes begin at 8:00 a.m. each day and your classes do not typically begin until at least 10:00 a.m. When he wakes up in the morning, he turns on the light and makes a lot of noise. It wakes you up every morning.`,
    reflection: [
      "How will you handle this conflict?"
    ],
    selTags: ["Relationship Skills","Responsible Decision-Making","Social Awareness","Self-Management"],
    assignedGroupType: "experimental"
  },
  {
    scenarioId: "S10",
    title: "Salina's frustrating day and missed invite",
    text: `Salina just had a very bad day. When she got up in the morning, she realized she needed her clean workout clothes, and they were still rolled up in a ball in her gym bag. She was angry with herself for forgetting to wash them. When her mom asked her what was wrong, she snapped, “Never mind. It’s not your problem.”Then she felt bad about snapping at her mom. When she got to first period, she was horrified when Mr. Jasper asked her to submit the first draft of her English assignment. She was sure he had said it was due tomorrow. At lunch, Donte asked her if she wanted to shoot hoops after school. She liked basketball, but she couldn’t tell if he was asking her for real or just teasing her. Although Salina thought it would be fun, she decided she didn’t want to be embarrassed if he was just kidding. She decided to play it safe by not going. That evening, Donte called Salina at home. “I waited for you on the court,”he said, sounding annoyed. “I thought you liked basketball.”Salina felt sick to her stomach because Donte really had wanted her to play and she missed her chance. She felt bummed out for the rest of the night.`,
    reflection: [
      "What else could Salina have said to her mom?",
      "What could Salina do next time to make sure she understands the English teacher’s expectations so that she isn’t surprised by the deadline?",
      "Why do you think Salina wasn’t sure if Donte was sincere about playing basketball?",
      "What could Salina do differently next time?",
      "What could Donte do differently next time?"
    ],
    selTags: ["Self-Management","Self-Awareness","Responsible Decision-Making","Relationship Skills"],
    assignedGroupType: "experimental"
  },
  {
    scenarioId: "S14",
    title: "Sharing finished paper with a classmate",
    text: `Jack and Diane are both in business class. Toward the end of the semester, the assignment is to do an analysis of a business plan. The paper is due in a couple of days and due to a family emergency, followed by being in bed all weekend with the flu, Jack hasn't had a chance to work on the paper and is very stressed out. Diane feels badly for Jack and since she has finished her analysis, she offers to loan Jack a copy of her paper so he can look it over to get a sense of how she broke down the assignment and then structured her response, figuring that should help Jack not feel so overwhelmed and make the project manageable. Jack gratefully accepts the offer. Diane sends him her analysis in an e-mail attachment.`,
    reflection: [
      "At this point, is this academic dishonesty? If so, what kind (plagiarism, cheating, etc.) and why?"
    ],
    selTags: ["Responsible Decision-Making","Social Awareness","Relationship Skills","Self-Management"],
    assignedGroupType: "control"
  }
];


async function seedScenarios() {
  const ops = DATA.map(doc => ({
    updateOne: {
      filter: { scenarioId: doc.scenarioId },
      update: { $set: doc },
      upsert: true
    }
  }));
  await Scenario.bulkWrite(ops);
  console.log('✅ Scenarios seeded/updated');
}

module.exports = { seedScenarios };

/**
 * CLI standalone:
 * אם מריצים ישירות: node seed/seedScenarios.js
 * במצב הזה בלבד נפתח/נסגור חיבור.
 */
if (require.main === module) {
  (async () => {
    try {
      const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/modular_skills';
      await mongoose.connect(uri);
      await seedScenarios();
    } catch (e) {
      console.error('❌ seedScenarios error:', e);
      process.exitCode = 1;
    } finally {
      await mongoose.disconnect();
    }
  })();
}