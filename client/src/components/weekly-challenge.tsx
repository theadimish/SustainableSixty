import { useState } from "react";
import { Challenge } from "@shared/schema";
import { differenceInDays } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

interface WeeklyChallengeProps {
  challenge: Challenge;
}

export default function WeeklyChallenge({ challenge }: WeeklyChallengeProps) {
  const [isParticipating, setIsParticipating] = useState(false);
  const { user } = useAuth();
  
  // Calculate days remaining
  const daysLeft = differenceInDays(new Date(challenge.endDate), new Date());
  
  const handleJoinChallenge = () => {
    setIsParticipating(true);
    // In a real app, we would make an API call to join the challenge
  };
  
  return (
    <div className="bg-gradient-to-r from-primary-dark to-primary text-white p-4 mx-4 my-3 rounded-lg shadow">
      <div className="flex items-start">
        <div className="mr-3 mt-1">
          <div className="bg-white/20 p-2 rounded-full">
            {challenge.topic === 'energy' && (
              <span className="material-icons">bolt</span>
            )}
            {challenge.topic === 'waste' && (
              <span className="material-icons">delete</span>
            )}
            {challenge.topic === 'biodiversity' && (
              <span className="material-icons">pets</span>
            )}
            {!['energy', 'waste', 'biodiversity'].includes(challenge.topic) && (
              <span className="material-icons">eco</span>
            )}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-bold">{challenge.title}</h3>
          <p className="text-sm opacity-90 mt-1">{challenge.description}</p>
          <div className="flex items-center mt-2">
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : 'Ending today'}
            </span>
            {user ? (
              <button 
                className={`ml-auto ${isParticipating 
                  ? 'bg-white/30 text-white' 
                  : 'bg-white text-primary'} text-sm font-accent px-3 py-1 rounded-full`}
                onClick={handleJoinChallenge}
                disabled={isParticipating}
              >
                {isParticipating ? 'Participating' : 'Join Challenge'}
              </button>
            ) : (
              <Link href="/auth">
                <a className="ml-auto bg-white text-primary text-sm font-accent px-3 py-1 rounded-full">
                  Login to Join
                </a>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
