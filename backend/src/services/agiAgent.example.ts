// agiAgent.example.ts
// Example usage of the AGI Agent Service

import { AGIAgentService } from './agiAgent.service';
import { AGIClient } from './agiClient.service';

/**
 * Example 1: Basic task execution
 */
async function basicExample() {
  const agentService = new AGIAgentService();

  try {
    // Create a session
    console.log('Creating session...');
    const session = await agentService.createSession({
      agent_name: 'agi-0',
      save_on_exit: false,
    });
    console.log(`Session created: ${session.session_id}`);
    console.log(`VNC URL: ${session.vnc_url}`);

    // Send a task
    console.log('Sending task...');
    await agentService.sendMessage(
      session.session_id,
      'Find three nonstop SFO→JFK options next month under $450',
      'https://www.kayak.com/flights'
    );

    // Wait for completion
    console.log('Waiting for completion...');
    const result = await agentService.waitForCompletion(session.session_id);

    console.log('Task completed!');
    console.log('Status:', result.status);
    console.log('Execution Status:', result.executionStatus);
    console.log('Messages:', result.messages.length);

    // Print all messages
    result.messages.forEach((msg) => {
      console.log(`[${msg.type}] ${msg.content}`);
    });

    // Clean up
    await agentService.deleteSession(session.session_id);
    console.log('Session deleted');
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 2: Using AGIClient (backward compatible)
 */
async function agiClientExample() {
  const client = new AGIClient();

  try {
    const result = await client.executeAction({
      url: 'https://real-networkin.vercel.app/platform/jobs/',
      task: 'search_jobs',
      instructions: 'Search for software engineering jobs in San Francisco',
      data: {
        position: 'engineer',
        locations: ['San Francisco'],
      },
    });

    console.log('Jobs found:', result.jobs?.length || 0);
    result.jobs?.forEach((job: any) => {
      console.log(`- ${job.title} at ${job.company}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 3: Advanced usage with control
 */
async function advancedExample() {
  const agentService = new AGIAgentService();

  try {
    const session = await agentService.createSession();

    // Navigate first
    await agentService.navigate(session.session_id, 'https://example.com');

    // Take a screenshot
    const screenshot = await agentService.getScreenshot(session.session_id);
    console.log('Screenshot taken:', screenshot.title);

    // Send a task
    await agentService.sendMessage(
      session.session_id,
      'Fill out the contact form with test data'
    );

    // Monitor progress with polling
    let afterId = 0;
    const maxPolls = 10;
    let pollCount = 0;

    while (pollCount < maxPolls) {
      const messages = await agentService.pollMessages(session.session_id, afterId, 5000);
      
      if (messages.length > 0) {
        messages.forEach((msg) => {
          console.log(`[${msg.type}] ${msg.content}`);
          afterId = Math.max(afterId, msg.id);
        });
      }

      const status = await agentService.getSessionStatus(session.session_id);
      if (status.execution_status === 'finished' || status.execution_status === 'error') {
        break;
      }

      pollCount++;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Clean up
    await agentService.deleteSession(session.session_id);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 4: Error handling and recovery
 */
async function errorHandlingExample() {
  const agentService = new AGIAgentService();

  let sessionId: string | null = null;

  try {
    const session = await agentService.createSession();
    sessionId = session.session_id;

    await agentService.sendMessage(sessionId, 'Perform a complex task');

    // Wait with timeout
    const result = await agentService.waitForCompletion(sessionId, 60000); // 1 minute timeout

    console.log('Task completed:', result.status);
  } catch (error: any) {
    console.error('Error occurred:', error.message);

    // Clean up on error
    if (sessionId) {
      try {
        await agentService.deleteSession(sessionId);
      } catch (cleanupError) {
        console.error('Failed to cleanup session:', cleanupError);
      }
    }
  }
}

// Uncomment to run examples:
// basicExample();
// agiClientExample();
// advancedExample();
// errorHandlingExample();

export {
  basicExample,
  agiClientExample,
  advancedExample,
  errorHandlingExample,
};

