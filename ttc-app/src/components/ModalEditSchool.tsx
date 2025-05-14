import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

interface SchoolData {
  id: number;
  school: string;
  personal_statement?: string;
  diversity_statement?: string;
  optional_statement_prompt?: string;
  letters_of_recommendation?: string;
  resume?: string;
  extras_addenda?: string;
  application_fee?: string;
  interviews?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  school: SchoolData | null;
  onSave: (schoolData: SchoolData) => void;
}

export default function ModalEditSchool({ isOpen, onClose, school, onSave }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const schoolData: SchoolData = {
      id: school?.id || 0,
      school: formData.get('school') as string,
      personal_statement: formData.get('personal_statement') as string,
      diversity_statement: formData.get('diversity_statement') as string,
      optional_statement_prompt: formData.get('optional_statement_prompt') as string,
      letters_of_recommendation: formData.get('letters_of_recommendation') as string,
      resume: formData.get('resume') as string,
      extras_addenda: formData.get('extras_addenda') as string,
      application_fee: formData.get('application_fee') as string,
      interviews: formData.get('interviews') as string,
    };
    onSave(schoolData);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between mb-4"
                >
                  <h3 className="text-lg font-bold leading-6 text-gray-900 dark:text-white">
                    {school ? 'Edit School' : 'Add New School'}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="school" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      School Name
                    </label>
                    <input
                      type="text"
                      name="school"
                      id="school"
                      defaultValue={school?.school}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-gray-100 dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label htmlFor="personal_statement" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Personal Statement Requirements
                    </label>
                    <textarea
                      name="personal_statement"
                      id="personal_statement"
                      rows={3}
                      defaultValue={school?.personal_statement}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-gray-100 dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label htmlFor="diversity_statement" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Diversity Statement Requirements
                    </label>
                    <textarea
                      name="diversity_statement"
                      id="diversity_statement"
                      rows={3}
                      defaultValue={school?.diversity_statement}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-gray-100 dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label htmlFor="optional_statement_prompt" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Optional Statement Prompt
                    </label>
                    <textarea
                      name="optional_statement_prompt"
                      id="optional_statement_prompt"
                      rows={3}
                      defaultValue={school?.optional_statement_prompt}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-gray-100 dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label htmlFor="letters_of_recommendation" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Letters of Recommendation Requirements
                    </label>
                    <textarea
                      name="letters_of_recommendation"
                      id="letters_of_recommendation"
                      rows={3}
                      defaultValue={school?.letters_of_recommendation}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-gray-100 dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label htmlFor="resume" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Resume Requirements
                    </label>
                    <textarea
                      name="resume"
                      id="resume"
                      rows={3}
                      defaultValue={school?.resume}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-gray-100 dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label htmlFor="extras_addenda" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Additional Requirements
                    </label>
                    <textarea
                      name="extras_addenda"
                      id="extras_addenda"
                      rows={3}
                      defaultValue={school?.extras_addenda}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-gray-100 dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label htmlFor="application_fee" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Application Fee
                    </label>
                    <input
                      type="text"
                      name="application_fee"
                      id="application_fee"
                      defaultValue={school?.application_fee}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-gray-100 dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label htmlFor="interviews" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Interview Information
                    </label>
                    <textarea
                      name="interviews"
                      id="interviews"
                      rows={3}
                      defaultValue={school?.interviews}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-gray-100 dark:bg-gray-700"
                    />
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 