// Chain of Responsibility Design Pattern
// The Chain of Responsibility design pattern is a behavioral design pattern that allows 
// an object to pass a request along a chain of potential handlers until the request is handled. 
// Each handler in the chain can either handle the request or pass it to the next handler in the chain. 
// This pattern promotes loose coupling and allows for dynamic handling of requests.

// Lets build a simple example of an interview process where a candidate goes through multiple rounds of interviews, 
// and each round can either pass the candidate to the next round or reject them. 
// We will have three rounds of interviews: HR, Technical, and Managerial.
// The candidate will be represented as a string (their name), and each interview round will be a handler in the chain.
// Define the abstract handler class
// Each interview round will extend this class and implement the handle method to process the candidate.
// The handle method will check if the candidate meets the criteria for that round and either pass them to the next round or reject them.
// Finally, we will create a client code to set up the chain of interviews and test it with a candidate.
// Abstract handler class
// Each interview round will extend this class and implement the handle method to process the candidate.

abstract class InterviewProcess {
    protected next: InterviewProcess | null = null;
    setNext(interviewProcess: InterviewProcess): void {
        this.next = interviewProcess;
    }
    abstract handle(candidate: string, score: string): void;
}

class HRRound extends InterviewProcess {
    handle(candidate: string, score: string): void {
        console.log(`HR Round: Evaluating ${candidate}`);
        if (parseInt(score) > 70) { // Dummy criteria for passing HR round
            console.log(`${candidate} passed HR round. Score of Candidate is ${score}`);
            if (this.next) {
                this.next.handle(candidate, score);
            }
        } else {
            console.log(`${candidate} rejected in HR round. Score of Candidate is ${score}`);
        }
    }
}

class TechnicalRound extends InterviewProcess {
    handle(candidate: string, score: string): void {
        console.log(`Technical Round: Evaluating ${candidate}`);
        if (parseInt(score) > 90) { // Dummy criteria for passing Technical round
            console.log(`${candidate} passed Technical round. Score of Candidate is ${score}`);
            if (this.next) {
                this.next.handle(candidate, score);
            }
        } else {
            console.log(`${candidate} rejected in Technical round. Score of Candidate is ${score}`);
        }
    }
}

class ManagerialRound extends InterviewProcess {
    handle(candidate: string, score: string): void {
        console.log(`Managerial Round: Evaluating ${candidate}`);
        if (parseInt(score) > 95) { // Dummy criteria for passing Managerial round
            console.log(`${candidate} passed Managerial round. Hired!. Score of Candidate is ${score}`);
        } else {
            console.log(`${candidate} rejected in Managerial round., Score of Candidate is ${score}`);
        }
    }
}

class clientcode {
    main() {
        // Client code to set up the chain of interviews and test it with a candidate.
        const hrRound = new HRRound();
        const technicalRound = new TechnicalRound();
        const managerialRound = new ManagerialRound();

        hrRound.setNext(technicalRound);
        technicalRound.setNext(managerialRound);

        const candidateName = "Ajay";
        hrRound.handle(candidateName, "96"); // Candidate passes HR round but fails Technical round

        console.log("\n");
    }
}
new clientcode().main();
export { };

// // Next example Issue tracking system where a bug report goes through different stages of severioty: L1,L2,L3
// // L1 - support engineer.
// // L2 - technical team
// // L3 - development team 
// // Each stage can either move the bug to the next stage or reject it based on certain criteria.
// // Abstract handler class
// // Each stage will extend this class and implement the handle method to process the bug report.

// interface IssueTrackerSystem {
//     handler(issue: string, severity: string): void;
//     setNext(IssueTrackerSystem: IssueTrackerSystem): void;
// }

// class L1Support implements IssueTrackerSystem {
//     private next: IssueTrackerSystem | null = null;
//     handler(issue: string, severity: string): void {
//         if (severity === "L1") {
//             console.log(`L1 support team is handling the issue: ${issue} with severity ${severity}`);
//         } else {
//             console.log(`L1 support team is passing the issue: ${issue} with severity ${severity} to L2 technical team`);
//             if (this.next) {
//                 this.next.handler(issue, severity);
//             }
//         }
//     }
//     setNext(IssueTrackerSystem: IssueTrackerSystem): void {
//         this.next = IssueTrackerSystem;
//     }
// }

// class L2TechnicalTeam implements IssueTrackerSystem {
//     private next: IssueTrackerSystem | null = null;
//     setNext(IssueTrackerSystem: IssueTrackerSystem): void {
//         this.next = IssueTrackerSystem
//     }
//     handler(issue: string, severity: string): void {
//         if (severity === "L2") {
//             console.log(`L2 technical team is handling the issue: ${issue} with severity ${severity}`);
//         } else {
//             console.log(`L2 technical team is passing the issue: ${issue} with severity ${severity} to L3 development team`);
//             if (this.next) {
//                 this.next.handler(issue, severity);
//             }
//         }
//     }
// }

// class L3DevelopmentTeam implements IssueTrackerSystem {
//     setNext(IssueTrackerSystem: IssueTrackerSystem): void {
//         // L3 is the last stage, so it does not pass the issue to any other team.
//         console.log("L3 development team is the last stage, so it does not pass the issue to any other team.");
//     }
//     handler(issue: string, severity: string): void {
//         if (severity === "L3") {
//             console.log(`L3 development team is handling the issue: ${issue} with severity ${severity}`);
//         } else {
//             console.log(`L3 development team cannot handle the issue: ${issue} with severity ${severity}. Issue is rejected.`);
//         }
//     }
// }


// class clientcodeIssueTracker {
//     main() {
//         const l1Support = new L1Support();
//         const l2TechnicalTeam = new L2TechnicalTeam();
//         const l3DevelopmentTeam = new L3DevelopmentTeam();
        
//         l1Support.setNext(l2TechnicalTeam);
//         l2TechnicalTeam.setNext(l3DevelopmentTeam);
        
//         l1Support.handler("Bug in login functionality", "L2"); // Issue is passed from L1 to L2 and handled by L2 technical team
//         console.log("\n");
//         l1Support.handler("Bug in payment gateway", "L3"); // Issue is passed from L1 to L2 and then to L3 and handled by L3 development team
//         console.log("\n");
//         l1Support.handler("Minor UI bug", "L1"); // Issue is handled by L1 support team
//         console.log("\n");
//         l1Support.handler("Critical security vulnerability", "L4"); // Issue is passed from L1 to L2 and then to L3 but rejected by L3 development team as severity is not recognized   
        
//     }
// }
// new clientcodeIssueTracker().main();
// export { };




