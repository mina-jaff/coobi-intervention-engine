## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Step Types and Rendering Guidelines](#step-types-and-rendering-guidelines)
5. [Conditional Branching](#conditional-branching)
6. [Localization](#localization)
7. [Platform-Specific Recommendations](#platform-specific-recommendations)
8. [Accessibility Considerations](#accessibility-considerations)

## API Overview

The Intervention Engine API allows you to:
- Fetch appropriate interventions for a user based on their health data
- Record user responses to steps
- Mark interventions as completed
- Retrieve a user's intervention history

## API Documentation

To help frontend developers understand and test the API, we've included interactive Swagger documentation:

### Accessing Swagger UI

1. Start the server:
   ```bash
   npm run dev

Open the Swagger UI in your browser:
http://localhost:3000/api-docs


Features
The Swagger documentation provides:

Complete API Reference: All endpoints and response structures
Interactive Testing: "Try it out" functionality to make API calls directly from the browser
Request/Response Examples: Sample data for each endpoint

Using Swagger for Frontend Development
Frontend developers can use this documentation to:

Understand Data Structures: See exactly what data structures are expected and returned
Test Endpoints: Verify endpoint behavior before implementing UI components
Explore Step Types: Understand the different intervention step types and their schemas
Debug Issues: When experiencing API-related problems, use Swagger to test endpoints directly

This documentation serves as the source of truth for the API contract between frontend and backend.

## Authentication

Authentication implementation is outside the scope of this guide, but I recommend using JWT tokens for secure API access.

## API Endpoints

### Get Today's Intervention
GET /api/users/:userId/interventions/today

Returns the intervention for today (if any) based on the user's health data and interaction history.

**Example Response:**

```json
{
  "intervention": {
    "id": "d395a203-056b-4c91-a2dd-e38c78722c40",
    "name": "Sleep Improvement",
    "description": "Techniques to improve your sleep quality and duration",
    "exercises": [
      {
        "id": "68d77b67-450c-4858-907f-5eeecabd108f",
        "name": "Deep Breathing Exercise",
        "description": "A simple breathing exercise to help you relax",
        "steps": [
          {
            "id": "a6fc5132-9276-40b9-af7f-5dd92e1ed215",
            "type": "INFORMATION",
            "content": {
              "title": "Introduction to Deep Breathing",
              "content": "Deep breathing is a simple but powerful relaxation technique...",
              "acknowledgmentRequired": true
            },
            "orderIndex": 0
          },
          {
            "id": "85e7249b-709d-43af-89fa-e871b80b3978",
            "type": "QUESTION_SINGLE_CHOICE",
            "content": {
              "title": "Current Stress Level",
              "question": "How would you rate your current stress level?",
              "options": [
                { "id": "opt-1", "text": "Very high", "value": 5 },
                { "id": "opt-2", "text": "High", "value": 4 },
                { "id": "opt-3", "text": "Moderate", "value": 3 },
                { "id": "opt-4", "text": "Low", "value": 2 },
                { "id": "opt-5", "text": "Very low", "value": 1 }
              ],
              "required": true
            },
            "orderIndex": 1
          }
        ]
      }
    ]
  },
  "interactionId": "1f514659-5cfb-4769-8df5-4a35809470ab"
}
Record Response to a Step
POST /api/interactions/:interactionId/steps/:stepId/response
Request Body:
json{
  "response": {
    // Format depends on step type (see below)
  }
}
Example Response:
json{
  "id": "7f9c6d5e-4b3a-2c1d-0f9e-8d7c6b5a4e3d",
  "userInteractionId": "1f514659-5cfb-4769-8df5-4a35809470ab",
  "stepId": "85e7249b-709d-43af-89fa-e871b80b3978",
  "response": {
    "selectedOptionId": "opt-3"
  },
  "createdAt": "2025-05-14T12:34:56.789Z"
}
Complete Intervention
POST /api/interactions/:interactionId/complete
Marks an intervention as completed.
Example Response:
json{
  "id": "1f514659-5cfb-4769-8df5-4a35809470ab",
  "userId": "1a46c026-361c-4c12-9b6a-8903447faf32",
  "interventionId": "d395a203-056b-4c91-a2dd-e38c78722c40",
  "date": "2025-05-14T10:34:39.583Z",
  "completed": true,
  "startedAt": "2025-05-14T10:34:39.583Z",
  "completedAt": "2025-05-14T12:45:23.456Z"
}
Get User Interactions
GET /api/users/:userId/interactions?limit=10&completed=true
Gets a user's interaction history.
Step Types and Rendering Guidelines
The intervention engine supports various step types for different interaction patterns. Each step type has a specific format and recommended rendering approach.
1. INFORMATION Step
Display simple information to the user.
JSON Structure:
json{
  "id": "a6fc5132-9276-40b9-af7f-5dd92e1ed215",
  "type": "INFORMATION",
  "content": {
    "title": "Introduction to Deep Breathing",
    "content": "Deep breathing is a simple but powerful relaxation technique...",
    "acknowledgmentRequired": true
  },
  "orderIndex": 0
}
Rendering Guidelines:

Display the title as a heading
Render the content (can include markdown formatting)
If acknowledgmentRequired is true, show a button to continue
When the user acknowledges, send:
json{
  "response": {
    "acknowledged": true
  }
}

2. QUESTION_SINGLE_CHOICE Step
A single-choice question with radio buttons.
JSON Structure:
json{
  "id": "85e7249b-709d-43af-89fa-e871b80b3978",
  "type": "QUESTION_SINGLE_CHOICE",
  "content": {
    "title": "Current Stress Level",
    "question": "How would you rate your current stress level?",
    "options": [
      { "id": "opt-1", "text": "Very high", "value": 5 },
      { "id": "opt-2", "text": "High", "value": 4 },
      { "id": "opt-3", "text": "Moderate", "value": 3 },
      { "id": "opt-4", "text": "Low", "value": 2 },
      { "id": "opt-5", "text": "Very low", "value": 1 }
    ],
    "required": true
  },
  "orderIndex": 1
}
Rendering Guidelines:

Display the title as a heading
Show the question text
Render radio buttons for each option
If required is true, prevent proceeding until an option is selected
When an option is selected, send:
json{
  "response": {
    "selectedOptionId": "opt-3"
  }
}

3. QUESTION_MULTIPLE_CHOICE Step
A multiple-choice question with checkboxes.
JSON Structure:
json{
  "id": "c6b5a4e3-d2c1-b0a9-8f7e-6d5c4b3a2d1e",
  "type": "QUESTION_MULTIPLE_CHOICE",
  "content": {
    "title": "Sleep Difficulties",
    "question": "Which difficulties do you experience with sleep?",
    "options": [
      { "id": "opt-1", "text": "Falling asleep", "value": "falling_asleep" },
      { "id": "opt-2", "text": "Staying asleep", "value": "staying_asleep" },
      { "id": "opt-3", "text": "Waking up too early", "value": "early_waking" },
      { "id": "opt-4", "text": "Feeling tired after sleep", "value": "tired_after" }
    ],
    "minSelections": 0,
    "maxSelections": 4,
    "required": true
  },
  "orderIndex": 2
}
Rendering Guidelines:

Display the title as a heading
Show the question text
Render checkboxes for each option
If minSelections is specified, require at least that many selections
If maxSelections is specified, limit user to that many selections
When options are selected, send:
json{
  "response": {
    "selectedOptionIds": ["opt-1", "opt-3"]
  }
}

4. TEXT_INPUT Step
A single-line text input field.
JSON Structure:
json{
  "id": "b4a3c2d1-e0f9-8d7c-6b5a-4e3d2c1b0a9",
  "type": "TEXT_INPUT",
  "content": {
    "title": "Sleep Time",
    "question": "What time do you usually go to bed?",
    "placeholder": "E.g., 10:30 PM",
    "maxLength": 100,
    "required": true
  },
  "orderIndex": 3
}
Rendering Guidelines:

Display the title as a heading
Show the question text
Render a single-line input field with the placeholder
Enforce the maxLength if specified
When the user enters text, send:
json{
  "response": {
    "text": "11:00 PM"
  }
}

5. TEXT_REFLECTION Step
Multi-prompt reflection with text areas.
JSON Structure:
json{
  "id": "66f0b446-c00f-424b-abef-94986e49b686",
  "type": "TEXT_REFLECTION",
  "content": {
    "title": "Sleep Reflection Questions",
    "introText": "Please take some time to reflect on the following questions:",
    "prompts": [
      { "id": "prompt-1", "text": "What time do you typically go to bed?", "placeholder": "For example: 10 PM, midnight, etc." },
      { "id": "prompt-2", "text": "What activities do you do before bed?", "placeholder": "For example: read, watch TV, use phone, etc." },
      { "id": "prompt-3", "text": "What helps you sleep better?", "placeholder": "For example: quiet room, cool temperature, etc." }
    ],
    "required": true
  },
  "orderIndex": 1
}
Rendering Guidelines:

Display the title as a heading
Show the introText if provided
For each prompt, display:

The prompt text
A multi-line text area with the placeholder


If required is true, require at least one prompt to be answered
When the user completes their reflection, send:
json{
  "response": {
    "reflections": [
      { "promptId": "prompt-1", "text": "Usually around 11 PM" },
      { "promptId": "prompt-2", "text": "Read books or browse social media" },
      { "promptId": "prompt-3", "text": "Dark room and white noise" }
    ]
  }
}

6. MEDIA Step
Display media content to the user.
JSON Structure:
json{
  "id": "e3d2c1b0-a9f8-d7c6-b5a4-e3d2c1b0a9f8",
  "type": "MEDIA",
  "content": {
    "title": "Sleep Relaxation Exercise",
    "mediaType": "video",
    "url": "https://example.com/videos/sleep-relaxation.mp4",
    "caption": "Follow along with this guided sleep relaxation exercise",
    "acknowledgmentRequired": true
  },
  "orderIndex": 4
}
Rendering Guidelines:

Display the title as a heading
Render the appropriate media player based on mediaType
Show the caption if provided
If acknowledgmentRequired is true, show a button to confirm the user has viewed the content
When the user acknowledges the content, send:
json{
  "response": {
    "acknowledged": true,
    "watchTimeSeconds": 120
  }
}

Conditional Branching
Steps may include conditional branching rules that determine which step should be shown next based on user responses.
Example Conditional Branching:
json{
  "id": "85e7249b-709d-43af-89fa-e871b80b3978",
  "type": "QUESTION_SINGLE_CHOICE",
  "content": {
    "title": "Current Stress Level",
    "question": "How would you rate your current stress level?",
    "options": [
      { "id": "opt-1", "text": "Very high", "value": 5 },
      { "id": "opt-2", "text": "High", "value": 4 },
      { "id": "opt-3", "text": "Moderate", "value": 3 },
      { "id": "opt-4", "text": "Low", "value": 2 },
      { "id": "opt-5", "text": "Very low", "value": 1 }
    ]
  },
  "nextStepRules": {
    "rules": [
      {
        "conditions": [
          { "field": "selectedOptionId", "operator": "equals", "value": "opt-1" },
          { "field": "selectedOptionId", "operator": "equals", "value": "opt-2" }
        ],
        "nextStepId": "intense-breathing-step"
      },
      {
        "conditions": [
          { "field": "selectedOptionId", "operator": "equals", "value": "opt-3" }
        ],
        "nextStepId": "moderate-breathing-step"
      }
    ],
    "defaultNextStepId": "light-breathing-step"
  }
}
Handling Guidelines:

After recording a response, check if the step has nextStepRules
Evaluate each rule's conditions against the user's response
Use the nextStepId from the first matching rule to determine which step to show next
If no conditions match, use the defaultNextStepId
If no rules are provided, proceed to the next step in order (by orderIndex)

Localization
Content should be displayed in the user's preferred language if available. Localized content is included in the API response as translations.
Example Localized Response:
json{
  "step": {
    "id": "a6fc5132-9276-40b9-af7f-5dd92e1ed215",
    "type": "INFORMATION",
    "content": {
      "title": "Introduction to Deep Breathing",
      "content": "Deep breathing is a simple but powerful relaxation technique..."
    },
    "translations": [
      {
        "language": "es",
        "content": {
          "title": "Introducción a la Respiración Profunda",
          "content": "La respiración profunda es una técnica de relajación simple pero poderosa..."
        }
      }
    ]
  }
}
Localization Guidelines:

Check user's preferred language setting
If a translation exists for that language, use the translated content
If no translation exists, fall back to the default content

Platform-Specific Recommendations
iOS

Use native UIKit components for consistency with iOS design patterns
For TEXT_REFLECTION, use UITextView for multi-line input
For QUESTION_SINGLE_CHOICE, use UISegmentedControl or radio-style UIButtons
For media content, use AVPlayer for video and audio playback

Example Swift Code:
swiftswitch step.type {
case "INFORMATION":
    let infoView = UILabel()
    infoView.text = step.content.content
    // Configure view...
    
case "QUESTION_SINGLE_CHOICE":
    let optionsStack = UIStackView()
    for option in step.content.options {
        let button = UIButton()
        button.setTitle(option.text, for: .normal)
        // Configure button...
        optionsStack.addArrangedSubview(button)
    }
    // Add to view...
    
// Handle other types...
}
Android

Follow Material Design guidelines
Use RadioButton for QUESTION_SINGLE_CHOICE
Use CheckBox for QUESTION_MULTIPLE_CHOICE
Use EditText with appropriate input types for text input
Use ExoPlayer for media playback

Example Kotlin Code:
kotlinwhen (step.type) {
    "INFORMATION" -> {
        val textView = TextView(context)
        textView.text = step.content.content
        // Configure view...
    }
    
    "QUESTION_SINGLE_CHOICE" -> {
        val radioGroup = RadioGroup(context)
        step.content.options.forEach { option ->
            val radioButton = RadioButton(context)
            radioButton.text = option.text
            // Configure button...
            radioGroup.addView(radioButton)
        }
        // Add to view...
    }
    
    // Handle other types...
}
Web

Use responsive design to ensure compatibility across devices
For QUESTION_SINGLE_CHOICE, use radio inputs
For QUESTION_MULTIPLE_CHOICE, use checkbox inputs
For TEXT_REFLECTION, use textarea elements
For media, use HTML5 video/audio elements with appropriate controls

Example React Component:
jsxconst StepRenderer = ({ step, onResponse }) => {
  switch (step.type) {
    case 'INFORMATION':
      return (
        <div className="step information-step">
          <h2>{step.content.title}</h2>
          <p>{step.content.content}</p>
          {step.content.acknowledgmentRequired && (
            <button onClick={() => onResponse({ acknowledged: true })}>
              Continue
            </button>
          )}
        </div>
      );
      
    case 'QUESTION_SINGLE_CHOICE':
      return (
        <div className="step choice-step">
          <h2>{step.content.title}</h2>
          <p>{step.content.question}</p>
          <div className="options">
            {step.content.options.map(option => (
              <label key={option.id}>
                <input
                  type="radio"
                  name={`step-${step.id}`}
                  onChange={() => onResponse({ selectedOptionId: option.id })}
                />
                {option.text}
              </label>
            ))}
          </div>
        </div>
      );
      
    // Handle other types...
  }
};
Accessibility Considerations
To ensure your intervention app is accessible to all users:

Ensure all UI elements have appropriate labels for screen readers
Use sufficient color contrast for text and UI elements (minimum 4.5:1 for normal text)
Provide alternative text for images and media
Support keyboard navigation for web interfaces
Implement proper focus management for interactive elements
Follow platform-specific accessibility guidelines:

iOS: Use UIAccessibility
Android: Follow Android Accessibility guidelines
Web: Adhere to WCAG 2.1 AA standards



Example Accessibility Implementation (Web):
jsx// Example of accessible radio button
<div className="radio-option">
  <input
    type="radio"
    id={`option-${option.id}`}
    name={`step-${step.id}`}
    onChange={() => onResponse({ selectedOptionId: option.id })}
    aria-labelledby={`label-${option.id}`}
  />
  <label id={`label-${option.id}`} htmlFor={`option-${option.id}`}>
    {option.text}
  </label>
</div>

This guide provides the information necessary for frontend developers to implement a user interface that can render the different step types and interact with the intervention API. If you have any questions or need further clarification, please contact our team.
