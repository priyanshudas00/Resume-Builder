import React, { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, ChevronDown, Wand2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateSummary, improveDescription, suggestSkills, generateAchievements } from '../utils/ai';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    achievements: string[];
  }[];
  education: {
    school: string;
    degree: string;
    field: string;
    graduationDate: string;
    gpa: string;
    achievements: string[];
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
  certifications: {
    name: string;
    issuer: string;
    date: string;
    url: string;
  }[];
  languages: {
    language: string;
    proficiency: string;
  }[];
}

const initialResumeData: ResumeData = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
  },
  experience: [],
  education: [],
  skills: [
    { category: 'Technical Skills', items: [] },
    { category: 'Soft Skills', items: [] },
  ],
  certifications: [],
  languages: [],
};

export default function ResumeBuilder() {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [activeSection, setActiveSection] = useState('personal');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handlePersonalInfoChange = (field: keyof ResumeData['personalInfo'], value: string) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  const addExperience = () => {
    setResumeData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          description: '',
          achievements: [],
        },
      ],
    }));
  };

  const handleExperienceChange = (
    index: number,
    field: keyof ResumeData['experience'][0],
    value: string | string[]
  ) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const removeExperience = (index: number) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const addEducation = () => {
    setResumeData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          school: '',
          degree: '',
          field: '',
          graduationDate: '',
          gpa: '',
          achievements: [],
        },
      ],
    }));
  };

  const handleEducationChange = (
    index: number,
    field: keyof ResumeData['education'][0],
    value: string | string[]
  ) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const removeEducation = (index: number) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const addSkill = (category: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.map((group) =>
        group.category === category
          ? { ...group, items: [...group.items, ''] }
          : group
      ),
    }));
  };

  const handleSkillChange = (category: string, index: number, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.map((group) =>
        group.category === category
          ? {
              ...group,
              items: group.items.map((item, i) => (i === index ? value : item)),
            }
          : group
      ),
    }));
  };

  const removeSkill = (category: string, index: number) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.map((group) =>
        group.category === category
          ? {
              ...group,
              items: group.items.filter((_, i) => i !== index),
            }
          : group
      ),
    }));
  };

  const addCertification = () => {
    setResumeData((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        { name: '', issuer: '', date: '', url: '' },
      ],
    }));
  };

  const handleCertificationChange = (
    index: number,
    field: keyof ResumeData['certifications'][0],
    value: string
  ) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) =>
        i === index ? { ...cert, [field]: value } : cert
      ),
    }));
  };

  const removeCertification = (index: number) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const addLanguage = () => {
    setResumeData((prev) => ({
      ...prev,
      languages: [...prev.languages, { language: '', proficiency: '' }],
    }));
  };

  const handleLanguageChange = (
    index: number,
    field: keyof ResumeData['languages'][0],
    value: string
  ) => {
    setResumeData((prev) => ({
      ...prev,
      languages: prev.languages.map((lang, i) =>
        i === index ? { ...lang, [field]: value } : lang
      ),
    }));
  };

  const removeLanguage = (index: number) => {
    setResumeData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };

  const handleGenerateSummary = async () => {
    try {
      setIsLoading(true);
      const experience = resumeData.experience
        .map((exp) => `${exp.position} at ${exp.company}: ${exp.description}`)
        .join('\n');
      const skills = resumeData.skills.flatMap((group) => group.items);
      
      const summary = await generateSummary(experience, skills);
      handlePersonalInfoChange('summary', summary);
      toast.success('Summary generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImproveDescription = async (index: number) => {
    try {
      setIsLoading(true);
      const description = resumeData.experience[index].description;
      const improved = await improveDescription(description);
      handleExperienceChange(index, 'description', improved);
      toast.success('Description improved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to improve description');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestSkills = async () => {
    try {
      setIsLoading(true);
      const experience = resumeData.experience
        .map((exp) => `${exp.position} at ${exp.company}: ${exp.description}`)
        .join('\n');
      
      const suggestedSkills = await suggestSkills(experience);
      
      setResumeData((prev) => ({
        ...prev,
        skills: prev.skills.map((group) =>
          group.category === 'Technical Skills'
            ? { ...group, items: [...new Set([...group.items, ...suggestedSkills])] }
            : group
        ),
      }));
      
      toast.success('Skills suggested successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to suggest skills');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAchievements = async (index: number) => {
    try {
      setIsLoading(true);
      const description = resumeData.experience[index].description;
      const achievements = await generateAchievements(description);
      
      setResumeData((prev) => ({
        ...prev,
        experience: prev.experience.map((exp, i) =>
          i === index ? { ...exp, achievements } : exp
        ),
      }));
      
      toast.success('Achievements generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate achievements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = () => {
    const element = document.getElementById('resume-preview');
    if (!element) {
      toast.error('Preview element not found');
      return;
    }

    const opt = {
      margin: 1,
      filename: `resume-${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    toast.promise(
      html2pdf().set(opt).from(element).save(),
      {
        loading: 'Generating PDF...',
        success: 'Resume exported successfully!',
        error: 'Failed to export resume',
      }
    );
  };

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
        <button
          onClick={handleExportPDF}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isLoading}
        >
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div
              className="px-4 py-5 border-b border-gray-200 sm:px-6 cursor-pointer"
              onClick={() =>
                setActiveSection(activeSection === 'personal' ? '' : 'personal')
              }
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Personal Information
                </h3>
                <ChevronDown
                  className={`h-5 w-5 transform transition-transform ${
                    activeSection === 'personal' ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>
            {activeSection === 'personal' && (
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={resumeData.personalInfo.name}
                      onChange={(e) =>
                        handlePersonalInfoChange('name', e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={resumeData.personalInfo.email}
                      onChange={(e) =>
                        handlePersonalInfoChange('email', e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={resumeData.personalInfo.phone}
                      onChange={(e) =>
                        handlePersonalInfoChange('phone', e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      value={resumeData.personalInfo.location}
                      onChange={(e) =>
                        handlePersonalInfoChange('location', e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="City, State"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label
                        htmlFor="summary"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Professional Summary
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateSummary}
                        disabled={isLoading}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                      >
                        <Wand2 className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Generate Summary
                      </button>
                    </div>
                    <textarea
                      id="summary"
                      name="summary"
                      rows={4}
                      value={resumeData.personalInfo.summary}
                      onChange={(e) =>
                        handlePersonalInfoChange('summary', e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg">
            <div
              className="px-4 py-5 border-b border-gray-200 sm:px-6 cursor-pointer"
              onClick={() =>
                setActiveSection(activeSection === 'experience' ? '' : 'experience')
              }
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Professional Experience
                </h3>
                <ChevronDown
                  className={`h-5 w-5 transform transition-transform ${
                    activeSection === 'experience' ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>
            {activeSection === 'experience' && (
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-6">
                  {resumeData.experience.map((exp, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-medium">
                          Experience {index + 1}
                        </h4>
                        <button
                          onClick={() => removeExperience(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <input
                          type="text"
                          placeholder="Company"
                          value={exp.company}
                          onChange={(e) =>
                            handleExperienceChange(index, 'company', e.target.value)
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Position"
                          value={exp.position}
                          onChange={(e) =>
                            handleExperienceChange(index, 'position', e.target.value)
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={exp.startDate}
                              onChange={(e) =>
                                handleExperienceChange(
                                  index,
                                  'startDate',
                                  e.target.value
                                )
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={exp.endDate}
                              onChange={(e) =>
                                handleExperienceChange(
                                  index,
                                  'endDate',
                                  e.target.value
                                )
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Description
                            </label>
                            <button
                              type="button"
                              onClick={() => handleImproveDescription(index)}
                              disabled={isLoading}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                            >
                              <Wand2 className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                              Improve
                            </button>
                          </div>
                          <textarea
                            value={exp.description}
                            onChange={(e) =>
                              handleExperienceChange(
                                index,
                                'description',
                                e.target.value
                              )
                            }
                            rows={4}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Key Achievements
                            </label>
                            <button
                              type="button"
                              onClick={() => handleGenerateAchievements(index)}
                              disabled={isLoading}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                            >
                              <Wand2 className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                              Generate
                            </button>
                          </div>
                          {exp.achievements.map((achievement, i) => (
                            <div key={i} className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={achievement}
                                onChange={(e) => {
                                  const newAchievements = [...exp.achievements];
                                  newAchievements[i] = e.target.value;
                                  handleExperienceChange(
                                    index,
                                    'achievements',
                                    newAchievements
                                  );
                                }}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Achievement"
                              />
                              <button
                                onClick={() => {
                                  const newAchievements = exp.achievements.filter(
                                    (_, index) => index !== i
                                  );
                                  handleExperienceChange(
                                    index,
                                    'achievements',
                                    newAchievements
                                  );
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const newAchievements = [...exp.achievements, ''];
                              handleExperienceChange(
                                index,
                                'achievements',
                                newAchievements
                              );
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Achievement
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addExperience}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg">
            <div
              className="px-4 py-5 border-b border-gray-200 sm:px-6 cursor-pointer"
              onClick={() =>
                setActiveSection(activeSection === 'education' ? '' : 'education')
              }
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Education
                </h3>
                <ChevronDown
                  className={`h-5 w-5 transform transition-transform ${
                    activeSection === 'education' ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>
            {activeSection === 'education' && (
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-6">
                  {resumeData.education.map((edu, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-medium">
                          Education {index + 1}
                        </h4>
                        <button
                          onClick={() => removeEducation(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <input
                          type="text"
                          placeholder="School"
                          value={edu.school}
                          onChange={(e) =>
                            handleEducationChange(index, 'school', e.target.value)
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Degree"
                          value={edu.degree}
                          onChange={(e) =>
                            handleEducationChange(index, 'degree', e.target.value)
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Field of Study"
                          value={edu.field}
                          onChange={(e) =>
                            handleEducationChange(index, 'field', e.target.value)
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Graduation Date
                            </label>
                            <input
                              type="date"
                              value={edu.graduationDate}
                              onChange={(e) =>
                                handleEducationChange(
                                  index,
                                  'graduationDate',
                                  e.target.value
                                )
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              GPA
                            </label>
                            <input
                              type="text"
                              placeholder="4.0"
                              value={edu.gpa}
                              onChange={(e) =>
                                handleEducationChange(index, 'gpa', e.target.value)
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Achievements & Activities
                          </label>
                          {edu.achievements.map((achievement, i) => (
                            <div key={i} className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={achievement}
                                onChange={(e) => {
                                  const newAchievements = [...edu.achievements];
                                  newAchievements[i] = e.target.value;
                                  handleEducationChange(
                                    index,
                                    'achievements',
                                    newAchievements
                                  );
                                }}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Achievement"
                              />
                              <button
                                onClick={() => {
                                  const newAchievements = edu.achievements.filter(
                                    (_, index) => index !== i
                                  );
                                  handleEducationChange(
                                    index,
                                    'achievements',
                                    newAchievements
                                  );
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const newAchievements = [...edu.achievements, ''];
                              handleEducationChange(
                                index,
                                'achievements',
                                newAchievements
                              );
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Achievement
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addEducation}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg">
            <div
              className="px-4 py-5 border-b border-gray-200 sm:px-6 cursor-pointer"
              onClick={() =>
                setActiveSection(activeSection === 'skills' ? '' : 'skills')
              }
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Skills
                </h3>
                <ChevronDown
                  className={`h-5 w-5 transform transition-transform ${
                    activeSection === 'skills' ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>
            {activeSection === 'skills' && (
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-6">
                  <button
                    type="button"
                    onClick={handleSuggestSkills}
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    <Wand2 className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Suggest Skills
                  </button>
                  {resumeData.skills.map((skillGroup) => (
                    <div key={skillGroup.category}>
                      <h4 className="text-lg font-medium mb-4">{skillGroup.category}</h4>
                      <div className="space-y-2">
                        {skillGroup.items.map((skill, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={skill}
                              onChange={(e) =>
                                handleSkillChange(
                                  skillGroup.category,
                                  index,
                                  e.target.value
                                )
                              }
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              placeholder="Skill"
                            />
                            <button
                              onClick={() => removeSkill(skillGroup.category, index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addSkill(skillGroup.category)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Skill
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg">
            <div
              className="px-4 py-5 border-b border-gray-200 sm:px-6 cursor-pointer"
              onClick={() =>
                setActiveSection(activeSection === 'certifications' ? '' : 'certifications')
              }
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Certifications
                </h3>
                <ChevronDown
                  className={`h-5 w-5 transform transition-transform ${
                    activeSection === 'certifications' ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>
            {activeSection === 'certifications' && (
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-6">
                  {resumeData.certifications.map((cert, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-medium">
                          Certification {index + 1}
                        </h4>
                        <button
                          onClick={() => removeCertification(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <input
                          type="text"
                          placeholder="Certification Name"
                          value={cert.name}
                          onChange={(e) =>
                            handleCertificationChange(index, 'name', e.target.value)
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Issuing Organization"
                          value={cert.issuer}
                          onChange={(e) =>
                            handleCertificationChange(index, 'issuer', e.target.value)
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        <input
                          type="date"
                          value={cert.date}
                          onChange={(e) =>
                            handleCertificationChange(index, 'date', e.target.value)
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        <input
                          type="url"
                          placeholder="Certification URL"
                          value={cert.url}
                          onChange={(e) =>
                            handleCertificationChange(index, 'url', e.target.value)
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCertification}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Certification
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg">
            <div
              className="px-4 py-5 border-b border-gray-200 sm:px-6 cursor-pointer"
              onClick={() =>
                setActiveSection(activeSection === 'languages' ? '' : 'languages')
              }
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Languages
                </h3>
                <ChevronDown
                  className={`h-5 w-5 transform transition-transform ${
                    activeSection === 'languages' ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>
            {activeSection === 'languages' && (
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-6">
                  {resumeData.languages.map((lang, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-medium">Language {index + 1}</h4>
                        <button
                          onClick={() => removeLanguage(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <input
                          type="text"
                          placeholder="Language"
                          value={lang.language}
                          onChange={(e) =>
                            handleLanguageChange(index, 'language', e.target.value)
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        <select
                          value={lang.proficiency}
                          onChange={(e) =>
                            handleLanguageChange(index, 'proficiency', e.target.value)
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">Select Proficiency</option>
                          <option value="Native">Native</option>
                          <option value="Fluent">Fluent</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Basic">Basic</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addLanguage}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Language
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 lg:mt-0">
          <div className="sticky top-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Preview</h2>
            <div
              id="resume-preview"
              className="bg-white shadow-lg rounded-lg p-8 min-h-[1056px] w-[816px] mx-auto"
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                  {resumeData.personalInfo.name || 'Your Name'}
                </h1>
                <div className="mt-2 text-gray-600">
                  {resumeData.personalInfo.email && (
                    <div>{resumeData.personalInfo.email}</div>
                  )}
                  {resumeData.personalInfo.phone && (
                    <div>{resumeData.personalInfo.phone}</div>
                  )}
                  {resumeData.personalInfo.location && (
                    <div>{resumeData.personalInfo.location}</div>
                  )}
                </div>
                {resumeData.personalInfo.summary && (
                  <p className="mt-4 text-gray-700">{resumeData.personalInfo.summary}</p>
                )}
              </div>

              {resumeData.experience.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Professional Experience
                  </h2>
                  {resumeData.experience.map((exp, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{exp.position}</h3>
                          <div className="text-gray-600">{exp.company}</div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {exp.startDate &&
                            `${format(new Date(exp.startDate), 'MMM yyyy')} - ${
                              exp.endDate
                                ? format(new Date(exp.endDate), 'MMM yyyy')
                                : 'Present'
                            }`}
                        </div>
                      </div>
                      <p className="mt-2 text-gray-700">{exp.description}</p>
                      {exp.achievements.length > 0 && (
                        <ul className="mt-2 list-disc list-inside text-gray-700">
                          {exp.achievements.map((achievement, i) => (
                            <li key={i}>{achievement}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {resumeData.education.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Education
                  </h2>
                  {resumeData.education.map((edu, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{edu.school}</h3>
                          <div className="text-gray-600">
                            {edu.degree}
                            {edu.field && ` in ${edu.field}`}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {edu.graduationDate &&
                            format(new Date(edu.graduationDate), 'MMM yyyy')}
                        </div>
                      </div>
                      {edu.gpa && (
                        <div className="text-gray-600 mt-1">GPA: {edu.gpa}</div>
                      )}
                      {edu.achievements.length > 0 && (
                        <ul className="mt-2 list-disc list-inside text-gray-700">
                          {edu.achievements.map((achievement, i) => (
                            <li key={i}>{achievement}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {resumeData.skills.some((group) => group.items.length > 0) && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
                  {resumeData.skills.map(
                    (group) =>
                      group.items.length > 0 && (
                        <div key={group.category} className="mb-4">
                          <h3 className="font-medium text-gray-900 mb-2">
                            {group.category}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {group.items.map((skill, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                  )}
                </div>
              )}

              {resumeData.certifications.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Certifications
                  </h2>
                  {resumeData.certifications.map((cert, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{cert.name}</h3>
                          <div className="text-gray-600">{cert.issuer}</div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {cert.date && format(new Date(cert.date), 'MMM yyyy')}
                        </div>
                      </div>
                      {cert.url && (
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 text-sm"
                        >
                          View Certificate
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {resumeData.languages.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Languages
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    {resumeData.languages.map((lang, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                      >
                        {lang.language} - {lang.proficiency}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}