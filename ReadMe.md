# Alyra Test Voting

## Unit tests
32 tests valides

Toutes les fonctions du contrat sont testées 

1 file: Voting.js

### tests for the registering period (11 tests)

- should add a voter if owner calls addVoter : *le owner s'ajoute lui-même dans le mapping des voters, on vérifie que isRegistered est bien true*

- should not add a voter twice if owner calls addVoter twice : *le owner se rajoute une nouvelle fois, on s'attend à Revert avec Already registered*

- should emit VoterRegistered event when addVoter is called correctly : *le owner rajoute second dans le mapping voters, on doit avoir l'event VoterRegistered qui est émis*

- should not add a voter if not called by the owner : *third essaie de s'ajouter dans voters, on s'attend à Revert avec Ownable: caller is not the owner*

- should add a voter (third) if owner calls addVoter : *le owner ajoute third dans le mapping des voters, on vérifie que isRegistered est bien true pour third*

- registered voters should not be able to suggest proposals yet : *la session d'enrengistrement des propositions n'a pas commencé, on vérifie qu'on a bien un Revert Proposals are not allowed yet si on essaie de proposer un proposal*

- registered voters should not be able to vote for proposals yet : *la session de voten'a pas commencé, on vérifie qu'on a bien un Revert Voting session havent started yet si on essaie de voter*

- owner should not be able to move to the ProposalsRegistrationEnded workflow status : *on ne peut pas sauter les étapes, on s'attend un à Revert Registering proposals havent started yet*

- owner should not be able to move to the VotingSessionStarted workflow status : *on ne peut pas sauter les étapes, on s'attend un à Revert Registering proposals phase is not finished*

- owner should not be able to move to the VotingSessionEnded workflow status : *on ne peut pas sauter les étapes, on s'attend un à Revert Voting session havent started yet*

- should not be able to tally votes : *on ne peut pas compter les votes avec tallyVotes car on n'a pas encore voté. On s'attend à un revert Current status is not voting session ended*

### tests for the proposal period (9 tests)

- only voters should be able to add a proposal : *on essaie de rajouter un proposal avec un compte qui n'est pas dans voters, on s'attend à un Revert You're not a voter*

- registered voters should be able to add proposals : *on rajoute un proposal avec un compte bien enrengistré. On vérifie qu'on a bien description qui est mis à jour*

- cannot suggest an empty proposal : *on essaie de rajouter un proposal vide avec un compte bien enrengistré. On s'attend un à Revert Vous ne pouvez pas ne rien proposer*

- should emit ProposalRegistered event when addProposal is called correctly : *on vérifie que l'event ProposalRegistered est émis quand on rajoute un proposal avec un compte bien enrengistré*

- registered voters should not be able to vote for proposals yet : *idem que lors de la session précédente : la session de vote n'a pas commencé, on vérifie qu'on a bien un Revert Voting session havent started yet si on essaie de voter*

- owner should not be able to move to the VotingSessionStarted workflow status : *idem que lors de la session précédente : on ne peut pas sauter les étapes, on s'attend un à Revert Registering proposals phase is not finished*

- owner should not be able to move to the VotingSessionEnded workflow status : *idem que lors de la session précédente : on ne peut pas sauter les étapes, on s'attend un à Revert Voting session havent started yet*

- should not be able to tally votes : *idem que lors de la session précédente : on ne peut pas compter les votes avec tallyVotes car on n'a pas encore voté. On s'attend à un revert Current status is not voting session ended*

- should not be able to add voters anymore : *on essaie de rajouter des voters alors que la période d'enrengistrement est terminée. On s'attend à un Revert 'Voters registration is not open yet' (le message n'est pas super approprié du coup, il faudrait pluôt dire que c'est terminé !)*

### tests for the period between end of proposals and voting (4 tests)

- owner should not be able to move to the VotingSessionEnded workflow status : *on teste qu'on ne peux pas clore les votes s'ils n'ont pas commencé. On s'attend à un Revert Voting session havent started yet*

- should not be able to tally votes : *idem que lors de la session précédente : on ne peut pas compter les votes avec tallyVotes car on n'a pas encore voté. On s'attend à un revert Current status is not voting session ended*

- should not be able to add voters anymore : *idem que lors de la session précédente : on essaie de rajouter des voters alors que la période d'enrengistrement est terminée. On s'attend à un Revert Voters registration is not open yet*

- should not be able to suggest proposals : *on vérifie qu'on ne peut plus suggérer de proposals maintenant que la période d'enrengistrement des proposals est terminée. On s'attend à un Revert Proposals are not allowed yet (ici aussi le message d'erreur n'est pas super correct)*

### tests for the voting period (4 tests)

- only voters should be able to vote : *on essaie de voter avec un compte qui n'est pas un voter enrengistré dans voters. On s'attend à un Revert You're not a voter*

- should emit Voted event when setVote is called correctly : *on vérifie que l'event Voted est émis lorsqu'un voter enrengistré dans voters vote*

- should not work if proposal id not in the proposal array : *on s'attend à un Revert.unspecified si on vote pour une proposition qui a un index qui n'est pas dans le tableau*

- should modify the hasVoted boolean once voted : *on vérifie qu'on modifie bien l'attribue hasVoted quand un voter enrengistré vote*

### tests for the last period (endVotingSession) (4 tests)

- only owner should be able to call tally votes : *on vérifie que seul l'owner peut compter les votes. On s'attend à un Revert Ownable: caller is not the owner si un autre utilisateur essaie d'appeler cette fonction*

- only owner should be able to call tally votes and should emit WorkflowStatusChange : *on vérifie que l'event WorkflowStatusChange est émis lorsque l'owner compte les votes avec tallyVotes*

- should not be able to add voters anymore : *idem que lors de la session précédente : on essaie de rajouter des voters alors que la période d'enrengistrement est terminée. On s'attend à un Revert 'Voters registration is not open yet'*

- should not be able to suggest proposals anymore : *idem que lors de la session précédente : on vérifie qu'on ne peut plus suggérer de proposals maintenant que la période d'enrengistrement des proposals est terminée. On s'attend à un Revert Proposals are not allowed yet (ici aussi le message d'erreur n'est pas super correct)*