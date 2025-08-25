# SignalNote Implementation Guide

This guide contains the essential templates and specifications for implementing the SignalNote MVP.

## 🤖 AI Analysis Prompt Templates

### 1. Feedback Analysis Prompt

The main prompt used in `src/lib/openai.ts` for analyzing customer feedback:

```typescript
const ANALYSIS_PROMPT = `You are an expert product manager analyzing customer feedback. Analyze the following feedback and provide a structured response.

Feedback: "{text}"

Provide your analysis in the following JSON format:
{
  "sentiment": 0.0-1.0, // 0 = very negative, 1 = very positive
  "urgency": 0.0-1.0,   // 0 = not urgent, 1 = extremely urgent
  "business_impact": 1-5, // 1 = low impact, 5 = critical impact
  "insights": [
    "Key insight 1",
    "Key insight 2", 
    "Key insight 3"
  ],
  "summary": "Brief summary of the feedback and its implications"
}

Guidelines:
- Sentiment: Consider tone, emotion, and overall satisfaction
- Urgency: Assess how quickly this needs attention
- Business Impact: Evaluate potential effect on business goals
- Insights: Extract 1-3 actionable insights
- Summary: 1-2 sentence summary for stakeholders

Be objective and business-focused in your analysis.`;
```

### 2. Cluster Label Generation

Used in `src/lib/clustering.ts` for generating meaningful cluster labels:

```typescript
const CLUSTER_LABEL_PROMPT = `Analyze these feedback items and generate a concise, business-focused label:

Feedback items:
{feedbackItems}

Generate a label that:
- Is 2-4 words maximum
- Describes the main theme or issue
- Uses business terminology
- Is actionable for product teams

Examples: "Performance Issues", "Feature Requests", "UX Problems", "Mobile Crashes"

Label:`;
```

### 3. Feature Request Generation

For converting clusters into actionable feature requests:

```typescript
const FEATURE_REQUEST_PROMPT = `Based on this cluster of feedback, generate a specific feature request:

Cluster: {clusterLabel}
Feedback count: {count}
Average sentiment: {avgSentiment}
Average urgency: {avgUrgency}

Generate a feature request that:
- Addresses the main pain point
- Is specific and implementable
- Includes business justification
- Suggests priority level

Feature Request:`;
```

### 4. Action Items Generation

For creating actionable next steps from clusters:

```typescript
const ACTION_ITEMS_PROMPT = `Based on this feedback cluster, suggest 2-3 specific action items:

Cluster: {clusterLabel}
Feedback: {feedbackItems}

Generate action items that are:
- Specific and measurable
- Prioritized by impact
- Assignable to teams
- Time-bound where possible

Action Items:`;
```

## 📊 CSV Upload Specification

### Required Columns

The CSV upload feature expects these exact column headers:

```csv
source,user_segment,product_area,text,created_at
```

### Column Definitions

| Column | Type | Required | Description | Examples |
|--------|------|----------|-------------|----------|
| `source` | string | Yes | Where feedback came from | `email`, `in-app`, `support`, `feedback_form`, `twitter`, `zoom`, `slack` |
| `user_segment` | string | Yes | Customer segment | `free`, `pro`, `enterprise`, `startup`, `enterprise` |
| `product_area` | string | Yes | Product feature area | `dashboard`, `search`, `mobile`, `reporting`, `ui`, `api`, `integrations` |
| `text` | string | Yes | The feedback content | Any text describing the feedback |
| `created_at` | string | Yes | When feedback was received | `2024-01-15T10:30:00Z` or `2024-01-15` |

### CSV Format Requirements

- **Encoding**: UTF-8
- **Delimiter**: Comma (,)
- **Quote Character**: Double quotes (")
- **Date Format**: ISO 8601 preferred, but flexible
- **File Size**: Maximum 10MB
- **Row Limit**: Maximum 1000 rows per upload

### Sample CSV File

```csv
source,user_segment,product_area,text,created_at
email,enterprise,dashboard,"The dashboard is too slow when loading large datasets",2024-01-15T10:30:00Z
in-app,pro,search,"Love the new search feature! It finds exactly what I need",2024-01-15T11:15:00Z
support,free,mobile,"App crashes when uploading files larger than 10MB",2024-01-15T14:20:00Z
feedback_form,enterprise,reporting,"Need Excel export functionality",2024-01-15T16:45:00Z
twitter,pro,ui,"Please add dark mode theme",2024-01-15T18:30:00Z
```

### Validation Rules

```typescript
// Validation logic from src/app/api/feedback/batch/route.ts
const validateCSV = (records: any[]) => {
  const requiredColumns = ['source', 'user_segment', 'product_area', 'text', 'created_at'];
  
  // Check required columns exist
  const headers = Object.keys(records[0] || {});
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }
  
  // Validate each row
  records.forEach((record, index) => {
    if (!record.text || record.text.trim().length === 0) {
      throw new Error(`Row ${index + 1}: text is required`);
    }
    
    if (!record.source || !record.user_segment || !record.product_area) {
      throw new Error(`Row ${index + 1}: source, user_segment, and product_area are required`);
    }
  });
};
```

## 📧 Referral Email Copy

### 1. Referral Invitation Email

**Subject**: `{Friend's Name} thinks you'd love SignalNote`

**Body**:
```
Hi {Friend's Name},

I've been using SignalNote to analyze customer feedback and it's been a game-changer for our product decisions. The AI-powered insights have helped us identify critical issues and prioritize features that actually matter to our users.

I thought you might find it valuable too, especially since you're also focused on building products users love.

Here's your personal invite link:
{ReferralLink}

What SignalNote does:
• Analyzes customer feedback with AI (sentiment, urgency, business impact)
• Groups similar feedback into actionable clusters
• Provides semantic search across all feedback
• Generates strategic insights and feature recommendations

It's perfect for product managers, customer success teams, and anyone who wants to make data-driven decisions from customer feedback.

Let me know if you have any questions!

Best,
{Your Name}

P.S. If you sign up through my link, we both get some extra features unlocked. Win-win! 🚀
```

### 2. Referral Success Email

**Subject**: `{Friend's Name} joined SignalNote! 🎉`

**Body**:
```
Hi {Your Name},

Great news! {Friend's Name} just joined SignalNote using your referral link.

You now have:
✅ 1 successful referral
✅ Unlocked beta features
✅ Early access to new capabilities

Keep sharing SignalNote with your network - every referral helps us both!

Your current stats:
• Total referrals: {TotalReferrals}
• Successful conversions: {SuccessfulReferrals}
• Conversion rate: {ConversionRate}%

Thanks for helping grow the SignalNote community!

Best,
The SignalNote Team
```

### 3. Referral Reminder Email

**Subject**: `Don't forget your SignalNote referral bonus!`

**Body**:
```
Hi {Your Name},

You're just {ReferralsNeeded} referral(s) away from unlocking premium features on SignalNote!

Current progress:
🔄 Referrals sent: {TotalReferrals}
✅ Successful conversions: {SuccessfulReferrals}
🎯 Goal: {GoalReferrals} referrals

Share your link with colleagues who might benefit from better customer feedback analysis:

{ReferralLink}

Quick reminder of what they get:
• AI-powered feedback analysis
• Strategic insights and clustering
• Semantic search capabilities
• Professional dashboard

And what you get:
• Unlock beta features
• Early access to new capabilities
• Premium support

Happy referring!
The SignalNote Team
```

### 4. Referral Tips Email

**Subject**: `Pro tips for more successful referrals`

**Body**:
```
Hi {Your Name},

Want to increase your referral success rate? Here are some proven strategies:

🎯 **Target the Right People**
• Product managers and PMs
• Customer success teams
• UX researchers
• Startup founders
• Anyone dealing with customer feedback

💬 **Personalize Your Message**
• Mention specific benefits for their role
• Share a quick win you've had
• Offer to walk them through it

📱 **Use Multiple Channels**
• LinkedIn messages
• Slack/Discord communities
• Product management forums
• Industry meetups
• Email newsletters

🚀 **Make It Easy**
• Send your referral link directly
• Offer to schedule a quick demo
• Share screenshots of insights
• Provide context about your use case

Your current stats:
• Referrals: {TotalReferrals}
• Success rate: {ConversionRate}%
• Rank: {Rank} out of {TotalUsers} users

Keep up the great work!
The SignalNote Team
```

## 🔧 Implementation Notes

### Email Templates

1. **Replace Variables**: All `{VariableName}` placeholders should be replaced with actual values
2. **Personalization**: Use the referrer's name and company for better engagement
3. **Branding**: Maintain consistent tone and style with your app
4. **Testing**: A/B test subject lines and content for optimal performance

### CSV Processing

1. **Error Handling**: Provide clear error messages for validation failures
2. **Progress Feedback**: Show upload progress and row processing status
3. **Data Cleaning**: Handle common CSV formatting issues (extra spaces, quotes, etc.)
4. **Batch Limits**: Enforce reasonable limits to prevent abuse

### Referral System

1. **Cookie Tracking**: Use secure, HTTP-only cookies for referral tracking
2. **Fraud Prevention**: Implement basic anti-fraud measures
3. **Analytics**: Track referral funnel metrics for optimization
4. **Incentives**: Consider tiered rewards for different referral milestones

## 📈 Optimization Tips

### AI Prompts
- Test different prompt variations for better results
- Monitor AI response quality and adjust prompts accordingly
- Consider prompt versioning for A/B testing

### CSV Upload
- Provide clear examples and templates
- Implement drag-and-drop for better UX
- Add preview functionality before processing

### Referral Emails
- Test different send times and frequencies
- Segment users by referral success rate
- Implement automated follow-up sequences

---

**Remember**: These templates are starting points. Test, iterate, and optimize based on your users' actual behavior and feedback!  
