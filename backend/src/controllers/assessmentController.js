const db = require('../config/db');
const { logAction } = require('../utils/auditLogger');

const submitAssessment = async (req, res) => {
  const { answers } = req.body;
  const userId = req.user.id;

  try {
   
    const totalScore = answers.reduce((sum, val) => sum + val, 0);
    
    let riskLevel = 'Low';
    if (totalScore >= 20) riskLevel = 'Severe';
    else if (totalScore >= 15) riskLevel = 'Moderately Severe';
    else if (totalScore >= 10) riskLevel = 'Moderate';
    else if (totalScore >= 5) riskLevel = 'Mild';

    
    const selfHarmIndicator = answers[8];
    if (selfHarmIndicator > 0) {
      riskLevel = 'Critical_Crisis';
    }

    
    const result = await db.query(
      'INSERT INTO assessments (user_id, answers, total_score, risk_level) VALUES ($1, $2, $3, $4) RETURNING id, total_score, risk_level, status',
      [userId, JSON.stringify(answers), totalScore, riskLevel]
    );

    
    await logAction(userId, 'SUBMIT_ASSESSMENT', `Assessment ID: ${result.rows[0].id}`, req.ip);

    res.status(201).json({
      message: 'Assessment submitted successfully.',
      data: result.rows[0],
      crisisFlag: riskLevel === 'Critical_Crisis' 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process assessment.' });
  }
};

const getAssessmentsQueue = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.id, a.total_score, a.risk_level, a.status, a.created_at, u.email 
      FROM assessments a
      JOIN users u ON a.user_id = u.id
      ORDER BY 
        CASE a.risk_level 
          WHEN 'Critical_Crisis' THEN 1
          WHEN 'Severe' THEN 2
          WHEN 'Moderately Severe' THEN 3
          WHEN 'Moderate' THEN 4
          WHEN 'Mild' THEN 5
          ELSE 6
        END,
        a.created_at ASC
    `);

    await logAction(req.user.id, 'VIEW_TRIAGE_QUEUE', 'Assessments Table', req.ip);

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve assessments.' });
  }
};

module.exports = { submitAssessment, getAssessmentsQueue };