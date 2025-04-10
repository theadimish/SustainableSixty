import { Challenge } from "@shared/schema";
import { differenceInDays } from "date-fns";

interface WeeklyChallengeProps {
  challenge: Challenge;
}

export default function WeeklyChallenge({ challenge }: WeeklyChallengeProps) {
  // Calculate days remaining
  const daysLeft = differenceInDays(new Date(challenge.endDate), new Date());
  
  return (
    <div className="bg-gradient-to-r from-primary-dark to-primary text-white p-4 mx-4 my-3 rounded-lg shadow">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="font-heading font-bold">{challenge.title}</h3>
          <p className="text-sm opacity-90 mt-1">{challenge.description}</p>
          <div className="flex items-center mt-2">
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : 'Ending today'}
            </span>
            <button className="ml-auto bg-white text-primary text-sm font-accent px-3 py-1 rounded-full">
              Join Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
