interface TeamMember {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
  status: 'accepté' | 'en attente';
}

interface TechnicalTeamCardProps {
  members: TeamMember[];
}

export const TechnicalTeamCard = ({ members }: TechnicalTeamCardProps) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="font-semibold mb-2">Équipe technique</div>
    <div className="flex flex-col gap-3">
      {members.map(m => (
        <div key={m.id} className="flex items-center gap-3">
          <img src={m.photoUrl || '/avatar.png'} alt={m.name} className="w-8 h-8 rounded-full object-cover" />
          <div className="flex-1">
            <div className="font-medium">{m.name}</div>
            <div className="text-xs text-gray-500">{m.role}</div>
          </div>
          <span className={`text-xs px-2 py-1 rounded ${m.status === 'accepté' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {m.status}
          </span>
          {/* <ChatIcon className="w-4 h-4 text-gray-400" /> */}
        </div>
      ))}
    </div>
  </div>
); 