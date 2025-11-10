const axios = require('axios');

// Test update profile endpoint
async function testUpdateProfile() {
  try {
    // Example user ID - change this to a real user ID from your database
    const userId = "6731b95a13f36e3f084e2ed5"; // Replace with actual user ID
    
    const payload = {
      userId: userId,
      userName: "UpdatedTestUser" + Date.now(),
      userEmail: "updated" + Date.now() + "@test.com"
    };

    console.log("Sending request to update profile...");
    console.log("Payload:", payload);

    const response = await axios.post('http://localhost:5000/auth/update-profile', payload);

    console.log("\n✅ Response Success:");
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log("\n❌ Error:");
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.log("Message:", error.message);
    }
  }
}

testUpdateProfile();
