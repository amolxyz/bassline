// AI Service for Strudel Music Generation (OpenAI GPT-5)
// This service handles communication with OpenAI API to provide intelligent music assistance
import { soundMap } from '@strudel/webaudio';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-5-mini'; // Correct model name for GPT-5
const FALLBACK_MODEL = 'gpt-4o'; // Fallback model if GPT-5 has issues

// Enhanced system prompt for comprehensive music assistance
const SYSTEM_PROMPT = `You are an expert music producer, live coding specialist, and creative AI assistant for Strudel, a live coding music platform. You excel at understanding musical context, providing intelligent suggestions, and helping users create, modify, and understand their music.

## Your Capabilities
- **Pattern Generation**: Create musical patterns that fit the current song context
- **Code Analysis**: Understand and analyze existing code to provide context-aware suggestions
- **Pattern Modification**: Suggest tweaks and improvements to existing patterns
- **Musical Education**: Explain concepts, answer questions, and provide guidance
- **Creative Inspiration**: Offer new ideas and directions for musical development
- **Problem Solving**: Help debug issues and optimize code performance

## About Strudel
Strudel is an official port of the Tidal Cycles pattern language to JavaScript, running entirely in the web browser. It's designed for live coding algorithmic patterns and making music with code in real time.

## Core Concepts
- **Cycles**: The fundamental time unit in Strudel. Default is 0.5 cycles per second (CPS), equivalent to 120 BPM
- **Patterns**: Abstract entities that represent flows of time as functions using pure functional reactive programming
- **Events**: Discrete musical events with values, begin times, and end times
- **Querying**: The process of generating events from a time span

## Key Syntax and Functions

### Basic Pattern Creation
- \`note("c4 d4 e4")\` - Creates melodic patterns
- \`s("bd hh sd")\` - Creates drum patterns using samples
- \`sequence(c3, [e3, g3])\` - Creates sequential patterns
- \`stack(pattern1, pattern2)\` - Combines patterns simultaneously

### Sound and Instrument Control
- \`.s("piano")\` - Sets the sound/instrument
- \`.bank("tr808")\` - Sets drum machine samples
- \`.gain(0.7)\` - Controls volume
- \`.room(0.6)\` - Adds reverb
- \`.cutoff(400)\` - Controls filter cutoff
- \`.resonance(0.3)\` - Controls filter resonance

### Available Sounds and Libraries
**Synthesizers**: piano, guitar, electric, acoustic, violin, flute, sine, square, sawtooth, triangle
**Drum Samples**: bd (bass drum), hh (hi-hat), sd (snare drum), cp (clap), rim, lt (low tom), mt (mid tom), ht (high tom)
**DSP Effects**: reverb, delay, phaser, lpf, hpf, feedbackdelay, fft processing
**Advanced**: superdough synthesis, motion sensors, MIDI, OSC, gamepad input, serial communication

### Pattern Transformations
- \`.fast(2)\` - Speeds up pattern by factor of 2
- \`.slow(2)\` - Slows down pattern by factor of 2
- \`.every(4, f)\` - Applies function f every 4 cycles
- \`.off(0.25, add(2))\` - Offsets pattern and applies transformation
- \`.jux(id, rev)\` - Applies different functions to left/right channels
- \`.iter(4)\` - Repeats pattern 4 times
- \`.euclid(3, 8)\` - Creates Euclidean rhythm with 3 pulses over 8 steps

### Mini-Notation
Strudel uses Tidal's mini-notation for concise rhythmic patterns:
- \`"c4 [e4 g4] d4"\` - Notes with brackets for subdivisions
- \`"bd [~ sd] hh"\` - Drum patterns with rests (~)
- \`"<0 2 4 6>"\` - Polymetric sequences
- \`"[0 1]*4"\` - Repeating patterns

### Effects and Processing
- \`.delay(0.8)\` - Adds delay effect
- \`.delaytime(0.125)\` - Sets delay time
- \`.shape(0.3)\` - Controls envelope shape
- \`.legato(0.25)\` - Extends note durations
- \`.phaser(4)\` - Adds phaser effect
- \`.lpf(500)\` - Low-pass filter
- \`.hpf(1000)\` - High-pass filter

### Tonal Functions
- \`.scale('D minor')\` - Sets musical scale
- \`.mode("root:g2")\` - Sets root note and mode
- \`.chord("maj7")\` - Creates chord patterns
- \`.voicing()\` - Applies voice leading

### Chord Creation
- \`note("<[c3,eb3,g3] [f3,a3,c4]>")\` - Creates chord patterns using brackets and commas
- \`note("[c3,e3,g3] [f3,a3,c4]")\` - Alternative chord syntax

## Response Guidelines

### For Pattern Generation Requests
1. Analyze the current song context and existing code
2. Generate patterns that complement and enhance the current musical direction
3. Consider the genre, mood, tempo, and instruments already in use
4. Provide patterns that can be easily modified and extended

### For Code Analysis and Questions
1. Examine the provided code context carefully
2. Identify musical elements, patterns, and structure
3. Provide clear, educational explanations
4. Suggest improvements or alternatives when appropriate

### For Pattern Modification Requests
1. Understand the existing pattern's musical function
2. Suggest specific, actionable changes
3. Explain the musical reasoning behind suggestions
4. Provide multiple options when possible

### For General Questions
1. Provide comprehensive, educational answers
2. Include practical examples and code snippets
3. Reference relevant Strudel concepts and functions
4. Encourage experimentation and learning

## Response Format
Your responses should be intelligent, contextual, and helpful. You can:

1. **Generate Code**: Return clean, executable Strudel code
2. **Explain Concepts**: Provide clear explanations with examples
3. **Suggest Modifications**: Offer specific improvements to existing code
4. **Answer Questions**: Give comprehensive answers about music theory, Strudel, or programming
5. **Provide Context**: Analyze existing code and explain what it does
6. **Offer Inspiration**: Suggest new directions or creative ideas

## Code Output Rules
- When generating code, return ONLY the pure code pattern without prefixes
- When suggesting modifications, clearly indicate what to change
- Include explanatory comments in code when helpful
- Ensure all code is immediately executable in the Strudel REPL

## Context Awareness
Always consider:
- The current song context (genre, mood, tempo, key, instruments)
- Existing code patterns and musical elements
- The user's skill level and goals
- Musical coherence and flow
- Live coding best practices

Remember: You are a creative AI music assistant, not just a pattern generator. Help users understand, create, and evolve their music through intelligent guidance and context-aware suggestions.`;

export function buildOpenAIMessages(output, inputValue, songContext = null, currentCode = null) {
  // output: array of {type: 'input'|'output'|'error', content: string}
  // inputValue: current user input
  // songContext: object with song preferences
  // currentCode: current code in the editor
  // Returns: OpenAI messages array
  
  let systemPrompt = SYSTEM_PROMPT;

  // Append available sounds from current library so the model only recommends valid sounds
  try {
    const sm = soundMap?.get?.() || {};
    const entries = Object.entries(sm).filter(([key]) => !key.startsWith('_'));
    if (entries.length) {
      const byType = entries.reduce((acc, [name, { data = {} } = {}]) => {
        const type = data.tag === 'drum-machines' ? 'drums' : ['synth', 'soundfont'].includes(data.type) ? 'synths' : data.type === 'sample' ? 'samples' : 'other';
        (acc[type] ||= []).push(name);
        return acc;
      }, {});
      const clip = (arr, n) => (arr || []).sort().slice(0, 80); // keep prompt compact
      const synths = clip(byType.synths, 80);
      const drums = clip(byType.drums, 80);
      const samples = clip(byType.samples, 80);
      const availableSection = [
        '## Available Sounds (use ONLY these exact names with .s())',
        synths.length ? `Synths: ${synths.join(', ')}` : null,
        drums.length ? `Drums: ${drums.join(', ')}` : null,
        samples.length ? `Samples: ${samples.join(', ')}` : null,
        'Do not invent or guess sound names. If a requested sound is not available, choose a similar one from the list.'
      ].filter(Boolean).join('\n');
      systemPrompt += `\n\n${availableSection}`;
    }
  } catch {}
  
  // Add song context to system prompt if available
  if (songContext && Object.values(songContext).some(value => value.trim() !== '')) {
    const contextParts = [];
    if (songContext.genre) contextParts.push(`Genre: ${songContext.genre}`);
    if (songContext.instruments) contextParts.push(`Instruments: ${songContext.instruments}`);
    if (songContext.mood) contextParts.push(`Mood: ${songContext.mood}`);
    if (songContext.tempo) contextParts.push(`Tempo: ${songContext.tempo} BPM`);
    if (songContext.key) contextParts.push(`Key: ${songContext.key}`);
    if (songContext.style) contextParts.push(`Style: ${songContext.style}`);
    if (songContext.additionalNotes) contextParts.push(`Notes: ${songContext.additionalNotes}`);
    
    const contextString = contextParts.join(', ');
    systemPrompt += `\n\n## Current Song Context\n${contextString}\n\nWhen generating patterns or making suggestions, prioritize and incorporate these preferences to create cohesive musical elements that fit the defined song context.`;
  }

  // Add current code context if available
  if (currentCode && currentCode.trim()) {
    systemPrompt += `\n\n## Current Code Context\n\`\`\`javascript\n${currentCode}\n\`\`\`\n\nAnalyze this code to understand the current musical direction, patterns, and context. Use this information to provide relevant suggestions, modifications, or complementary patterns.`;
  }
  
  const messages = [
    { role: 'system', content: systemPrompt },
    ...output
      .filter(item => item.type === 'input' || item.type === 'output')
      .map(item => ({
        role: item.type === 'input' ? 'user' : 'assistant',
        content: item.content
      })),
    { role: 'user', content: inputValue }
  ];
  return messages;
}

export class AIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async generateMusicPattern(userRequest, chatHistory = [], songContext = null, currentCode = null) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build comprehensive messages with all available context
    const messages = buildOpenAIMessages(chatHistory, userRequest, songContext, currentCode);

    try {
      // Try with GPT-5 first
      const response = await this._makeOpenAIRequest(OPENAI_MODEL, messages);
      return response;
    } catch (error) {
      console.warn('GPT-5 request failed, trying fallback model:', error);
      
      // If GPT-5 fails, try with fallback model
      try {
        const fallbackResponse = await this._makeOpenAIRequest(FALLBACK_MODEL, messages);
        return fallbackResponse;
      } catch (fallbackError) {
        console.error('Both GPT-5 and fallback model failed:', fallbackError);
        throw fallbackError;
      }
    }
  }

  async _makeOpenAIRequest(model, messages) {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1000, // Increased for more comprehensive responses
        temperature: 0.8, // Slightly higher for more creative output
        messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
        // If we can't parse the error, use the raw text
        if (errorText) {
          errorMessage = errorText;
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      return data.choices[0].message.content.trim();
    } else {
      throw new Error('Invalid response format from OpenAI API');
    }
  }

  // New method for analyzing current code and providing context-aware suggestions
  async analyzeCodeAndSuggest(currentCode, songContext = null) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Analyze this Strudel code and provide insights about:
1. What musical elements and patterns are present
2. The overall musical direction and style
3. Potential improvements or variations
4. Complementary patterns that could enhance the composition
5. Any issues or optimizations

Code to analyze:
\`\`\`javascript
${currentCode}
\`\`\``;

    try {
      // Try with GPT-5 first
      const response = await this._makeOpenAIRequest(OPENAI_MODEL, [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ]);
      return response;
    } catch (error) {
      console.warn('GPT-5 analysis failed, trying fallback model:', error);
      
      // If GPT-5 fails, try with fallback model
      try {
        const fallbackResponse = await this._makeOpenAIRequest(FALLBACK_MODEL, [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ]);
        return fallbackResponse;
      } catch (fallbackError) {
        console.error('Both GPT-5 and fallback model failed:', fallbackError);
        throw fallbackError;
      }
    }
  }
}

// Create a singleton instance
let aiServiceInstance = null;

export function getAIService() {
  if (!aiServiceInstance) {
    // Try to get API key from environment or localStorage
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key');
    aiServiceInstance = new AIService(apiKey);
  }
  return aiServiceInstance;
}

export function setAPIKey(apiKey) {
  localStorage.setItem('openai_api_key', apiKey);
  aiServiceInstance = new AIService(apiKey);
} 