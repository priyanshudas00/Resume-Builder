import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Resume {
  id: string;
  created_at: string;
  title: string;
  user_id: string;
}

export default function Dashboard() {
  const { supabase, user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);

  useEffect(() => {
    if (user) {
      fetchResumes();
    }
  }, [user]);

  const fetchResumes = async () => {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setResumes(data);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">My Resumes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create and manage your professional resumes
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/builder"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Resume
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {resumes.map((resume) => (
          <div
            key={resume.id}
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-10 w-10 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{resume.title}</h3>
                <p className="text-sm text-gray-500">
                  Created {new Date(resume.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Link
              to={`/builder/${resume.id}`}
              className="absolute inset-0 rounded-lg focus:outline-none"
            >
              <span className="sr-only">View resume</span>
            </Link>
          </div>
        ))}

        {resumes.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No resumes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new resume.
            </p>
            <div className="mt-6">
              <Link
                to="/builder"
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Resume
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}