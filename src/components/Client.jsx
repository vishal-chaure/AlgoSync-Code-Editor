import React from 'react';
import { Users } from 'lucide-react';

const Client = ({ username }) => {
    return (
        <div className="flex items-center space-x-3 p-3 bg-secondary/30 rounded-lg">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">{username}</span>
        </div>
    );
};

export default Client;
