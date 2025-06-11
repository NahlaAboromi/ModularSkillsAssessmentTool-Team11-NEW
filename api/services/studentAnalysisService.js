const claudeService = require('./claudeService');
// Analyzes a student's response using Claude AI and the CASEL 5 SEL framework
async function analyzeStudentResponse({ situation, question, studentResponse, studentName }) {
    // Prepare the prompt message for Claude AI with all required analysis instructions
  const messages = [
    {
      role: 'user',
      content: `Analyze the following student response to a social-emotional learning situation according to the CASEL 5 framework.

Situation: "${situation}"
Question: "${question}"
Student Response: "${studentResponse}"

Analyze across:
1. Self-awareness
2. Self-management
3. Social awareness
4. Relationship skills
5. Responsible decision-making

Return a JSON object with:
- Score (1-5) per competency
- Brief feedback
- Observed strengths
- Areas for improvement
- Overall score
- suggestedIntervention (string)
- redFlags (list)
- estimatedDepthLevel (string)`
    }
  ];
  
  // Call Claude service to analyze the student response
  const result = await claudeService.chat(messages, {
    maxTokens: 1500,
    temperature: 0.3
  });

  if (!result.success) {
    console.error('❌ Claude failed:', result.error);
    return null;
  }
    // Extract the AI's response text
  const aiText = result.data.content[0].text;

  try {
        // Try to extract and parse the JSON object from the AI's response
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (error) {
    console.error('❌ Error parsing JSON from Claude:', aiText);
    return null;
  }
}

module.exports = { analyzeStudentResponse };
