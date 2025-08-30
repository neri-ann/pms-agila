// Test script to verify automatic budget update system
// This demonstrates the complete workflow from request creation to budget update

const mongoose = require('mongoose');
const Budget = require('./Models/budget');
const ProcRequest = require('./Models/procReqest');

async function testBudgetUpdateSystem() {
    try {
        console.log('🧪 Starting Budget Update System Test...\n');

        // 1. Create a test budget
        console.log('📋 Step 1: Creating test budget...');
        const testBudget = new Budget({
            department: 'DEIE',
            fiscalYear: 2025,
            budgetPeriod: 'ANNUAL',
            budgetAllocation: 100000,
            usedAmount: 0,
            description: 'Test budget for automatic update system',
            status: 'ACTIVE'
        });
        
        await testBudget.save();
        console.log(`✅ Budget created: ${testBudget._id}`);
        console.log(`   - Budget Allocation: ₱${testBudget.budgetAllocation.toLocaleString()}`);
        console.log(`   - Used Amount: ₱${testBudget.usedAmount.toLocaleString()}`);
        console.log(`   - Available Balance: ₱${testBudget.availableBalance.toLocaleString()}\n`);

        // 2. Create a test procurement request
        console.log('📝 Step 2: Creating procurement request...');
        const testRequest = new ProcRequest({
            requestId: 'TEST001',
            faculty: 'Engineering Faculty',
            department: 'DEIE',
            budgetPeriod: 'ANNUAL',
            fiscalYear: 2025,
            budgetId: testBudget._id,
            date: new Date(),
            contactPerson: 'Test Officer',
            contactNo: 1234567890,
            purpose: 'normal',
            status: 'Pending',
            items: [
                {
                    itemName: 'Laptop Computer',
                    cost: 25000,
                    qtyRequired: 2,
                    qtyAvailable: 0,
                    action: 'Purchase'
                },
                {
                    itemName: 'Printer',
                    cost: 15000,
                    qtyRequired: 1,
                    qtyAvailable: 0,
                    action: 'Purchase'
                }
            ]
        });

        await testRequest.save();
        console.log(`✅ Procurement request created: ${testRequest.requestId}`);
        console.log(`   - Total items cost: ₱${testRequest.usedAmount.toLocaleString()}`);
        console.log(`   - Status: ${testRequest.status}\n`);

        // 3. Check budget before approval
        await testBudget.reload();
        console.log('📊 Step 3: Budget status before approval:');
        console.log(`   - Used Amount: ₱${testBudget.usedAmount.toLocaleString()}`);
        console.log(`   - Available Balance: ₱${testBudget.availableBalance.toLocaleString()}\n`);

        // 4. Simulate admin approval
        console.log('✅ Step 4: Simulating admin approval...');
        testRequest.status = 'Approved';
        await testRequest.save();
        console.log(`   - Request ${testRequest.requestId} approved!\n`);

        // 5. Wait briefly for middleware to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // 6. Check budget after approval
        await testBudget.reload();
        console.log('📊 Step 5: Budget status after approval:');
        console.log(`   - Used Amount: ₱${testBudget.usedAmount.toLocaleString()}`);
        console.log(`   - Available Balance: ₱${testBudget.availableBalance.toLocaleString()}\n`);

        // 7. Verify calculations
        const expectedUsedAmount = (25000 * 2) + (15000 * 1); // 65000
        const actualUsedAmount = testBudget.usedAmount;
        const expectedAvailable = 100000 - expectedUsedAmount; // 35000
        const actualAvailable = testBudget.availableBalance;

        console.log('🧮 Step 6: Verification:');
        console.log(`   - Expected used amount: ₱${expectedUsedAmount.toLocaleString()}`);
        console.log(`   - Actual used amount: ₱${actualUsedAmount.toLocaleString()}`);
        console.log(`   - Expected available: ₱${expectedAvailable.toLocaleString()}`);
        console.log(`   - Actual available: ₱${actualAvailable.toLocaleString()}`);
        
        if (actualUsedAmount === expectedUsedAmount && actualAvailable === expectedAvailable) {
            console.log('✅ TEST PASSED: Budget update system working correctly!\n');
        } else {
            console.log('❌ TEST FAILED: Budget calculations incorrect!\n');
        }

        // 8. Cleanup test data
        console.log('🧹 Step 7: Cleaning up test data...');
        await ProcRequest.deleteOne({ _id: testRequest._id });
        await Budget.deleteOne({ _id: testBudget._id });
        console.log('✅ Test data cleaned up\n');

        console.log('🎉 Budget Update System Test Complete!');

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

module.exports = { testBudgetUpdateSystem };

// Run test if this file is executed directly
if (require.main === module) {
    // Connect to MongoDB (update connection string as needed)
    mongoose.connect('mongodb://localhost:27017/nerieann_ganda')
        .then(() => {
            console.log('📡 Connected to MongoDB for testing\n');
            return testBudgetUpdateSystem();
        })
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('Database connection error:', error);
            process.exit(1);
        });
}
