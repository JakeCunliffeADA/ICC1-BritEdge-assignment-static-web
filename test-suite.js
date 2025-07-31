/**
 * BritEdge Solutions - Comprehensive Test Suite
 * Tests all APIs, security headers, performance, and functionality
 */

class BritEdgeTestSuite {
  constructor() {
    this.baseURL = 'https://func-britedge-assignment.azurewebsites.net/api';
    this.websiteURL = 'https://thankful-sand-085c06103.2.azurestaticapps.net';
    this.results = [];
    this.startTime = Date.now();
  }

  // Test result logging
  logResult(testName, passed, message, data = null) {
    const result = {
      test: testName,
      status: passed ? 'PASS' : 'FAIL',
      message: message,
      timestamp: new Date().toISOString(),
      data: data
    };
    this.results.push(result);
    
    const statusIcon = passed ? '✅' : '❌';
    console.log(`${statusIcon} ${testName}: ${message}`);
    if (data) console.log('  Data:', data);
  }

  // API Tests
  async testGetBritEdgeInfo() {
    try {
      const response = await fetch(`${this.baseURL}/GetBritEdgeInfo`);
      const data = await response.json();
      
      if (response.status === 200) {
        // Validate response structure
        const hasCompany = data.company && data.company.name;
        const hasStats = data.stats && typeof data.stats.totalEmployees === 'number';
        const hasLocations = Array.isArray(data.locations) && data.locations.length > 0;
        
        if (hasCompany && hasStats && hasLocations) {
          this.logResult('API: GetBritEdgeInfo', true, 
            `Valid company data returned (${data.stats.totalEmployees} employees, ${data.locations.length} locations)`);
        } else {
          this.logResult('API: GetBritEdgeInfo', false, 'Invalid response structure', data);
        }
      } else {
        this.logResult('API: GetBritEdgeInfo', false, `HTTP ${response.status} error`);
      }
    } catch (error) {
      this.logResult('API: GetBritEdgeInfo', false, `Network error: ${error.message}`);
    }
  }

  async testGetTestimonials() {
    try {
      const response = await fetch(`${this.baseURL}/GetTestimonials`);
      const data = await response.json();
      
      if (response.status === 200) {
        const hasTestimonials = Array.isArray(data.testimonials);
        const hasValidStructure = data.testimonials && data.testimonials.length > 0 && 
          data.testimonials[0].client && data.testimonials[0].rating;
        
        if (hasTestimonials && hasValidStructure) {
          this.logResult('API: GetTestimonials', true, 
            `${data.testimonials.length} testimonials returned with valid structure`);
        } else {
          this.logResult('API: GetTestimonials', false, 'Invalid testimonials structure', data);
        }
      } else {
        this.logResult('API: GetTestimonials', false, `HTTP ${response.status} error`);
      }
    } catch (error) {
      this.logResult('API: GetTestimonials', false, `Network error: ${error.message}`);
    }
  }

  async testGetCustomers() {
    try {
      const response = await fetch(`${this.baseURL}/GetCustomers`);
      const data = await response.json();
      
      if (response.status === 200) {
        const hasCustomers = Array.isArray(data.customers);
        const hasValidStructure = data.customers && data.customers.length > 0 && 
          data.customers[0].customerId && data.customers[0].companyName;
        
        if (hasCustomers && hasValidStructure) {
          this.logResult('API: GetCustomers', true, 
            `${data.customers.length} customers returned with valid structure`);
        } else {
          this.logResult('API: GetCustomers', false, 'Invalid customers structure', data);
        }
      } else {
        this.logResult('API: GetCustomers', false, `HTTP ${response.status} error`);
      }
    } catch (error) {
      this.logResult('API: GetCustomers', false, `Network error: ${error.message}`);
    }
  }

  // Security Header Tests
  async testSecurityHeaders() {
    try {
      const response = await fetch(this.websiteURL);
      const headers = response.headers;
      
      const securityTests = [
        { name: 'X-Frame-Options', expected: 'DENY' },
        { name: 'X-Content-Type-Options', expected: 'nosniff' },
        { name: 'X-XSS-Protection', expected: '1; mode=block' },
        { name: 'Strict-Transport-Security', contains: 'max-age=' }
      ];
      
      let passedHeaders = 0;
      securityTests.forEach(test => {
        const headerValue = headers.get(test.name);
        if (test.expected && headerValue === test.expected) {
          passedHeaders++;
        } else if (test.contains && headerValue && headerValue.includes(test.contains)) {
          passedHeaders++;
        }
      });
      
      const allPassed = passedHeaders === securityTests.length;
      this.logResult('Security: Headers', allPassed, 
        `${passedHeaders}/${securityTests.length} security headers correctly configured`);
        
    } catch (error) {
      this.logResult('Security: Headers', false, `Error checking headers: ${error.message}`);
    }
  }

  // HTTPS Test
  async testHTTPS() {
    try {
      const httpsTest = this.websiteURL.startsWith('https://');
      this.logResult('Security: HTTPS', httpsTest, 
        httpsTest ? 'Website uses HTTPS encryption' : 'Website not using HTTPS');
    } catch (error) {
      this.logResult('Security: HTTPS', false, `HTTPS test failed: ${error.message}`);
    }
  }

  // CORS Test
  async testCORS() {
    try {
      const response = await fetch(`${this.baseURL}/GetBritEdgeInfo`);
      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      
      const corsConfigured = corsHeader === '*' || corsHeader === this.websiteURL;
      this.logResult('Security: CORS', corsConfigured, 
        corsConfigured ? `CORS properly configured: ${corsHeader}` : 'CORS not configured correctly');
    } catch (error) {
      this.logResult('Security: CORS', false, `CORS test failed: ${error.message}`);
    }
  }

  // Performance Tests
  async testResponseTimes() {
    const endpoints = [
      { name: 'Website', url: this.websiteURL },
      { name: 'GetBritEdgeInfo API', url: `${this.baseURL}/GetBritEdgeInfo` },
      { name: 'GetTestimonials API', url: `${this.baseURL}/GetTestimonials` },
      { name: 'GetCustomers API', url: `${this.baseURL}/GetCustomers` }
    ];

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await fetch(endpoint.url);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        const isGood = responseTime < 2000; // Under 2 seconds is good
        this.logResult(`Performance: ${endpoint.name}`, isGood, 
          `Response time: ${responseTime}ms ${isGood ? '(Good)' : '(Slow)'}`);
      } catch (error) {
        this.logResult(`Performance: ${endpoint.name}`, false, 
          `Failed to test response time: ${error.message}`);
      }
    }
  }

  // Functionality Tests
  async testWebsiteNavigation() {
    try {
      const response = await fetch(this.websiteURL);
      const html = await response.text();
      
      // Check for key navigation elements
      const hasNavigation = html.includes('nav-link') || html.includes('navigation');
      const hasContent = html.includes('BritEdge') && html.includes('Manufacturing');
      const hasTailwind = html.includes('tailwindcss');
      
      const functionalityScore = [hasNavigation, hasContent, hasTailwind].filter(Boolean).length;
      
      this.logResult('Functionality: Website', functionalityScore === 3, 
        `Website functionality check: ${functionalityScore}/3 elements found`);
    } catch (error) {
      this.logResult('Functionality: Website', false, 
        `Website functionality test failed: ${error.message}`);
    }
  }

  // JSON Response Validation
  async testJSONResponses() {
    const apiEndpoints = ['GetBritEdgeInfo', 'GetTestimonials', 'GetCustomers'];
    let validResponses = 0;

    for (const endpoint of apiEndpoints) {
      try {
        const response = await fetch(`${this.baseURL}/${endpoint}`);
        const data = await response.json();
        
        if (typeof data === 'object' && data !== null) {
          validResponses++;
        }
      } catch (error) {
        // JSON parsing failed
      }
    }

    const allValid = validResponses === apiEndpoints.length;
    this.logResult('Functionality: JSON APIs', allValid, 
      `${validResponses}/${apiEndpoints.length} APIs return valid JSON`);
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting BritEdge Solutions Test Suite...\n');
    
    // API Tests
    console.log('📡 Testing APIs...');
    await this.testGetBritEdgeInfo();
    await this.testGetTestimonials();
    await this.testGetCustomers();
    await this.testJSONResponses();
    
    // Security Tests
    console.log('\n🔒 Testing Security...');
    await this.testSecurityHeaders();
    await this.testHTTPS();
    await this.testCORS();
    
    // Performance Tests
    console.log('\n⚡ Testing Performance...');
    await this.testResponseTimes();
    
    // Functionality Tests
    console.log('\n🎯 Testing Functionality...');
    await this.testWebsiteNavigation();
    
    // Generate summary
    this.generateSummary();
  }

  generateSummary() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'PASS').length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    const totalTime = Date.now() - this.startTime;

    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUITE SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log(`⏱️ Total Time: ${totalTime}ms`);
    console.log('='.repeat(50));

    if (failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.filter(r => r.status === 'FAIL').forEach(result => {
        console.log(`  - ${result.test}: ${result.message}`);
      });
    }

    // Export results for documentation
    return {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: successRate,
        executionTime: totalTime
      },
      results: this.results
    };
  }
}

// Auto-run if loaded in browser
if (typeof window !== 'undefined') {
  window.BritEdgeTestSuite = BritEdgeTestSuite;
  
  // Add a global function to run tests
  window.runBritEdgeTests = async function() {
    const testSuite = new BritEdgeTestSuite();
    return await testSuite.runAllTests();
  };
  
  console.log('✅ BritEdge Test Suite loaded!');
  console.log('💡 Run tests with: runBritEdgeTests()');
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BritEdgeTestSuite;
}