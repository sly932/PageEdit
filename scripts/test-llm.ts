import 'dotenv/config';
import { LLMService } from '../src/utils/nlp/llmService.js';

async function testLLM() {
    const testConfig = {
        openai: {
            provider: 'openai' as const,
            apiKey: process.env.OPENAI_API_KEY || '',
            model: 'gpt-4.1',
            baseUrl: process.env.OPENAI_API_BASE_URL
        },
        claude: {
            provider: 'claude' as const,
            apiKey: process.env.CLAUDE_API_KEY || '',
            model: 'anthropic.claude-3.5-sonnet',
            baseUrl: process.env.CLAUDE_API_BASE_URL
        }
    };

    console.log('OpenAI Config:', {
        baseUrl: testConfig.openai.baseUrl,
        apiKey: testConfig.openai.apiKey ? testConfig.openai.apiKey : 'Not Set'
    });

    console.log('Claude Config:', {
        baseUrl: testConfig.claude.baseUrl,
        apiKey: testConfig.claude.apiKey ? testConfig.openai.apiKey : 'Not Set'
    });

    // 示例HTML内容
    const sampleHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>测试页面</title>
        </head>
        <body>
            <header>
                <h1>主标题</h1>
                <h2>副标题</h2>
                <h3>小标题</h3>
            </header>
            <main>
                <p>这是一个段落</p>
                <p>这是另一个段落</p>
                <div class="content">
                    <p class="highlight">这是高亮段落</p>
                    <p id="special">这是特殊段落</p>
                </div>
            </main>
        </body>
        </html>
    `;

    const testCases = [
        {
            input: '把背景改成蓝色',
            htmlContext: sampleHtml,
            expected: {
                target: 'body',
                property: 'background-color',
                value: 'blue'
            }
        },
        {
            input: '把主标题改成大号',
            htmlContext: sampleHtml,
            expected: {
                target: 'h1',
                property: 'font-size',
                value: '24px'
            }
        },
        {
            input: '把高亮段落改成红色',
            htmlContext: sampleHtml,
            expected: {
                target: '.highlight',
                property: 'color',
                value: 'red'
            }
        },
        {
            input: '把特殊段落改成绿色',
            htmlContext: sampleHtml,
            expected: {
                target: '#special',
                property: 'color',
                value: 'green'
            }
        }
    ];

    console.log('\n=== Testing OpenAI API ===');
    if (!testConfig.openai.apiKey) {
        console.warn('OpenAI API key not found in environment variables');
    } else {
        const openaiService = LLMService.getInstance(testConfig.openai);
        for (const testCase of testCases) {
            console.log(`\nTesting input: "${testCase.input}"`);
            try {
                const response = await openaiService.processInput(testCase.input, testCase.htmlContext);
                console.log('Raw response:', response);
                
                try {
                    const results = JSON.parse(response);
                    const result = Array.isArray(results) ? results[0] : results;
                    
                    if (result) {
                        console.log('Parsed result:', {
                            target: result.target,
                            property: result.property,
                            value: result.value,
                            confidence: result.confidence,
                            explanation: result.explanation
                        });
                        console.log('Expected:', testCase.expected);
                        console.log('Match:', 
                            result.target === testCase.expected.target &&
                            result.property === testCase.expected.property &&
                            result.value === testCase.expected.value
                        );
                    } else {
                        console.log('Failed: No valid result in response');
                    }
                } catch (parseError) {
                    console.error('Error parsing response:', parseError);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }

    console.log('\n=== Testing Claude API ===');
    if (!testConfig.claude.apiKey) {
        console.warn('Claude API key not found in environment variables');
    } else {
        const claudeService = LLMService.getInstance(testConfig.claude);
        for (const testCase of testCases) {
            console.log(`\nTesting input: "${testCase.input}"`);
            try {
                const response = await claudeService.processInput(testCase.input, testCase.htmlContext);
                console.log('Raw response:', response);
                
                try {
                    const results = JSON.parse(response);
                    const result = Array.isArray(results) ? results[0] : results;
                    
                    if (result) {
                        console.log('Parsed result:', {
                            target: result.target,
                            property: result.property,
                            value: result.value,
                            confidence: result.confidence,
                            explanation: result.explanation
                        });
                        console.log('Expected:', testCase.expected);
                        console.log('Match:', 
                            result.target === testCase.expected.target &&
                            result.property === testCase.expected.property &&
                            result.value === testCase.expected.value
                        );
                    } else {
                        console.log('Failed: No valid result in response');
                    }
                } catch (parseError) {
                    console.error('Error parsing response:', parseError);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }
}

testLLM().catch(console.error); 