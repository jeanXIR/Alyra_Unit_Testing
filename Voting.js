const Voting = artifacts.require("./Voting.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Voting', accounts => {
    const owner = accounts[0];
    const second = accounts[1];
    const third = accounts[2];
    const fourth = accounts[3];
    const fifth = accounts[4];
      
    let VotingInstance;

    describe("tests for the registering period", function () {

        before(async function () {
            VotingInstance = await Voting.new({from:owner});
        });

        it("should add a voter if owner calls addVoter", async () => {
            await VotingInstance.addVoter(owner, { from: owner });
            const storedData = await VotingInstance.getVoter(owner);
            expect(storedData.isRegistered).to.equal(true);
        });

        it("should not add a voter twice if owner calls addVoter twice", async () => {
            expectRevert(VotingInstance.addVoter(owner, { from: owner }), 'Already registered');
        });

        it("should emit VoterRegistered event when addVoter is called correctly", async () => {
            const findEvent = await VotingInstance.addVoter(second, { from: owner });
            expectEvent(findEvent,"VoterRegistered", {voterAddress: second});
        });

        it("should not add a voter if not called by the owner", async () => {
            expectRevert(VotingInstance.addVoter(third, { from: third }), 'Ownable: caller is not the owner');
        });

        it("should add a voter (third) if owner calls addVoter", async () => {
            await VotingInstance.addVoter(third, { from: owner });
            const storedData = await VotingInstance.getVoter(third);
            expect(storedData.isRegistered).to.equal(true);
        });

        it("registered voters should not be able to suggest proposals yet", async () => {
            expectRevert(VotingInstance.addProposal("Proposition 1", { from: second }), 'Proposals are not allowed yet');
        });

        it("registered voters should not be able to vote for proposals yet", async () => {
            expectRevert(VotingInstance.setVote(1, { from: second }), 'Voting session havent started yet');
        });

        it("owner should not be able to move to the ProposalsRegistrationEnded workflow status", async () => {
            expectRevert(VotingInstance.endProposalsRegistering({ from: owner }), 'Registering proposals havent started yet');
        });

        it("owner should not be able to move to the VotingSessionStarted workflow status", async () => {
            expectRevert(VotingInstance.startVotingSession({ from: owner }), 'Registering proposals phase is not finished');
        });

        it("owner should not be able to move to the VotingSessionEnded workflow status", async () => {
            expectRevert(VotingInstance.endVotingSession({ from: owner }), 'Voting session havent started yet');
        });
        
        it("should not be able to tally votes", async () => {
            expectRevert(VotingInstance.tallyVotes({ from: owner }), "Current status is not voting session ended");
        });

    });

    describe("tests for the proposal period", function () {

        before(async function () {
            VotingInstance = await Voting.new({from:owner});
            await VotingInstance.addVoter(owner, { from: owner });
            await VotingInstance.addVoter(second, { from: owner });
            await VotingInstance.addVoter(third, { from: owner });
            await VotingInstance.startProposalsRegistering({ from: owner });
        });

        it("only voters should be able to add a proposal", async () => {
            expectRevert(VotingInstance.addProposal("prop A", { from: fifth }), "You're not a voter");
        });

        it("registered voters should be able to add proposals", async () => {
            await VotingInstance.addProposal("prop A", { from: third });
            const storedData = await VotingInstance.getOneProposal(0);
            expect(storedData.description).to.equal("prop A");
        });

        it("cannot suggest an empty proposal", async () => {
            expectRevert(VotingInstance.addProposal("", { from: third }), 'Vous ne pouvez pas ne rien proposer');
        });

        it("should emit ProposalRegistered event when addProposal is called correctly", async () => {
            const findEvent = await VotingInstance.addProposal("Prop B", { from: owner });
            expectEvent(findEvent,"ProposalRegistered", {proposalId: new BN(1)});
        });

        it("registered voters should not be able to vote for proposals yet", async () => {
            expectRevert(VotingInstance.setVote(1, { from: third }), 'Voting session havent started yet');
        });

        it("owner should not be able to move to the VotingSessionStarted workflow status", async () => {
            expectRevert(VotingInstance.startVotingSession({ from: owner }), 'Registering proposals phase is not finished');
        });

        it("owner should not be able to move to the VotingSessionEnded workflow status", async () => {
            expectRevert(VotingInstance.endVotingSession({ from: owner }), 'Voting session havent started yet');
        });
        
        it("should not be able to tally votes", async () => {
            expectRevert(VotingInstance.tallyVotes({ from: owner }), "Current status is not voting session ended");
        });

        it("should not be able to add voters anymore", async () => {
            expectRevert(VotingInstance.addVoter(owner, { from: owner }), 'Voters registration is not open yet');
        });

    });

    describe("tests for the period between end of proposals and voting", function () {

        before(async function () {
            VotingInstance = await Voting.new({from:owner});
            await VotingInstance.addVoter(owner, { from: owner });
            await VotingInstance.addVoter(second, { from: owner });
            await VotingInstance.addVoter(third, { from: owner });
            await VotingInstance.startProposalsRegistering({ from: owner });
            await VotingInstance.addProposal("Prop A",{ from: third });
            await VotingInstance.addProposal("Prop B",{ from: owner });
            await VotingInstance.endProposalsRegistering({ from: owner });
        });

        it("owner should not be able to move to the VotingSessionEnded workflow status", async () => {
            expectRevert(VotingInstance.endVotingSession({ from: owner }), 'Voting session havent started yet');
        });
        
        it("should not be able to tally votes", async () => {
            expectRevert(VotingInstance.tallyVotes({ from: owner }), "Current status is not voting session ended");
        });

        it("should not be able to add voters anymore", async () => {
            expectRevert(VotingInstance.addVoter(owner, { from: owner }), 'Voters registration is not open yet');
        });

        it("should not be able to suggest proposals", async () => {
            expectRevert(VotingInstance.addProposal("prop C", { from: owner }), 'Proposals are not allowed yet');
        });

    });
    

    describe("tests for the voting period", function () {

        before(async function () {
            VotingInstance = await Voting.new({from:owner});
            await VotingInstance.addVoter(owner, { from: owner });
            await VotingInstance.addVoter(second, { from: owner });
            await VotingInstance.addVoter(third, { from: owner });
            await VotingInstance.startProposalsRegistering({ from: owner });
            await VotingInstance.addProposal("Prop A",{ from: third });
            await VotingInstance.addProposal("Prop B",{ from: owner });
            await VotingInstance.endProposalsRegistering({ from: owner });
            
        });
        

        it("only voters should be able to vote", async () => {
            await VotingInstance.startVotingSession({ from: owner });
            expectRevert(VotingInstance.setVote(0, { from: fifth }), "You're not a voter");
        });

        it("should emit Voted event when setVote is called correctly", async () => {
            const findEvent = await VotingInstance.setVote(0, { from: owner });
            expectEvent(findEvent,"Voted", {voter: owner, proposalId: new BN(0)});
        });

        it("should not work if proposal id not in the proposal array", async () => {
            expectRevert.unspecified(VotingInstance.setVote(10, { from: second }));
        });

        it("should modify the hasVoted boolean once voted", async () => {
            await VotingInstance.setVote(0, { from: second });
            const storedData = await VotingInstance.getVoter(second);
            expect(storedData.hasVoted).to.equal(true);
        });
    
    });

    describe("tests for the last period (endVotingSession)", function () {

        before(async function () {
            VotingInstance = await Voting.new({from:owner});
            await VotingInstance.addVoter(owner, { from: owner });
            await VotingInstance.addVoter(second, { from: owner });
            await VotingInstance.addVoter(third, { from: owner });
            await VotingInstance.startProposalsRegistering({ from: owner });
            await VotingInstance.addProposal("Prop A",{ from: third });
            await VotingInstance.addProposal("Prop B",{ from: owner });
            await VotingInstance.endProposalsRegistering({ from: owner });
            await VotingInstance.startVotingSession({ from: owner });
            await VotingInstance.setVote(0, { from: owner });
            await VotingInstance.setVote(0, { from: second });
            await VotingInstance.endVotingSession({ from: owner });
        });

        it("only owner should be able to call tally votes", async () => {
            expectRevert(VotingInstance.tallyVotes({ from: third }), 'Ownable: caller is not the owner');
        });

        it("only owner should be able to call tally votes and should emit WorkflowStatusChange", async () => {
            const findEvent = VotingInstance.tallyVotes({ from: owner });
            storedData = await VotingInstance.winningProposalID;
            expect(new BN(storedData.hasVoted)).to.be.bignumber.equal(new BN(0));
        });

        it("should not be able to add voters anymore", async () => {
            expectRevert(VotingInstance.addVoter(fifth, { from: owner }), 'Voters registration is not open yet');
        });

        it("should not be able to suggest proposals anymore", async () => {
            expectRevert(VotingInstance.addProposal("prop C", { from: owner }), 'Proposals are not allowed yet');
        });

    });

});
