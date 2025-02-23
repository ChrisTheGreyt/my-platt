import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { useCreateSchoolMutation } from '../state/api';

interface AddSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddSchoolModal: React.FC<AddSchoolModalProps> = ({ isOpen, onClose }) => {
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const userId = useSelector((state: RootState) => state.auth.userId);
  const [createSchool, { isLoading, isError, error }] = useCreateSchoolMutation();

  const handleSchoolChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSchool(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedSchool && userId) {
      try {
        console.log('Making POST request to /api/schools with data:', { userId, name: selectedSchool });
        await createSchool({ userId, schoolName: selectedSchool }).unwrap();
        onClose();
      } catch (err) {
        console.error('Failed to add school:', err);
      }
    }
  };

  return (
    <div className={`modal ${isOpen ? 'is-active' : ''}`}>
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Add School</p>
          <button className="delete" aria-label="close" onClick={onClose}></button>
        </header>
        <form onSubmit={handleSubmit}>
          <section className="modal-card-body">
            <div className="field">
              <label className="label">Select School</label>
              <div className="control">
                <div className="select">
                  <select value={selectedSchool} onChange={handleSchoolChange}>
                    <option value="">Select a school</option>
                    <option value="Harvard Law School">Harvard Law School</option>
                    <option value="Yale Law School">Yale Law School</option>
                    <option value="Stanford Law School">Stanford Law School</option>
                    {/* Add more school options as needed */}
                  </select>
                </div>
              </div>
            </div>
          </section>
          <footer className="modal-card-foot">
            <button type="submit" className="button is-primary" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add School'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddSchoolModal;
