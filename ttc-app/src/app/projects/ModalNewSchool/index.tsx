import Modal from "@/components/Modal";
import React, { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSchoolSelect: (school: string) => void;
};

const ModalNewSchool = ({ isOpen, onClose, onSchoolSelect }: Props) => {
  const [school, setSchool] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;
    onSchoolSelect(school);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Select a School">
      <form className="mt-4" onSubmit={handleSubmit}>
        <div className="w-80">
          <label htmlFor="school" className="block text-sm font-medium text-gray-700">
            Select a School
          </label>
          <select
            id="school"
            name="school"
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            required
          >
            <option value="" disabled>
              Select your school
            </option>
            <option>Stanford University</option>
            <option>Yale University</option>
            <option>University of Chicago</option>
            <option>Duke University</option>
            <option>Harvard University</option>
            <option>University of Pennsylvania (Carey)</option>
            <option>University of Virginia</option>
            <option>Columbia University</option>
            <option>New York Law School</option>
            <option>Northwestern University (Pritzker)</option>
            <option>University of Michigan – Ann Arbor</option>
            <option>University of California, Berkeley</option>
            <option>University of California – Los Angeles</option>
            <option>Cornell University</option>
            <option>Georgetown University</option>
            <option>University of Minnesota</option>
            <option>University of Texas - Austin</option>
            <option>Washington University in St. Louis</option>
            <option>Vanderbilt University</option>
            <option>University of Georgia</option>
            <option>University of North Carolina – Chapel Hill</option>
            <option>University of Notre Dame</option>
            <option>University of Southern California (Gould)</option>
            <option>Boston University</option>
            <option>Wake Forest University</option>
            <option>Ohio State University (Moritz)</option>
            <option>Texas A&M University</option>
            <option>Boston College</option>
            <option>Brigham Young University (Clark)</option>
            <option>George Mason University (Scalia)</option>
            <option>University of Florida (Levin)</option>
            <option>University of Utah</option>
            <option>Fordham University</option>
            <option>University of Alabama</option>
            <option>Washington and Lee University</option>
            <option>Arizona State University (O’Connor)</option>
            <option>University of Illinois Urbana-Champaign</option>
            <option>University of Iowa</option>
            <option>University of Wisconsin - Madison</option>
            <option>Williams & Mary Law School</option>
            <option>George Washington University</option>
            <option>Emory University</option>
            <option>Indiana University – Bloomington (Maurer)</option>
            <option>Southern Methodist University (Dedman)</option>
            <option>University of California - Irvine</option>
            <option>Baylor University</option>
            <option>University of Kansas</option>
            <option>Florida State University</option>
            <option>University of Colorado – Boulder</option>
            <option>University of Washington</option>
            <option>Villanova University (Widger)</option>
            <option>Pepperdine University (Caruso)</option>
            <option>University of Tennessee – Knoxville</option>
            <option>Temple University (Beasley)</option>
            <option>University of Arizona (Rogers)</option>
            <option>University of California – Davis</option>
            <option>University of Connecticut</option>
            <option>University of Maryland</option>
            <option>University of Oklahoma</option>
            <option>Wayne State University</option>
            <option>Loyola Marymount University</option>
            <option>Seton Hall University</option>
            <option>University of Kentucky (Rosenberg)</option>
            <option>University of Missouri (Columbia)</option>
            <option>Yeshiva University (Cardozo)</option>
            <option>University of Richmond</option>
            <option>University of South Carolina (Columbia)</option>
            <option>Florida International University</option>
            <option>Marquette University</option>
            <option>Northeastern University</option>
            <option>Pennsylvania State University – University Park</option>
            <option>St John’s University</option>
            <option>University of Houston Law Center</option>
            <option>University of San Diego</option>
            <option>Drexel University (Kline)</option>
            <option>Georgia State University</option>
            <option>Penn State University Dickinson Law</option>
            <option>Loyola University Chicago</option>
            <option>Tulane University</option>
            <option>University of Cincinnati</option>
            <option>University of Nevada – Las Vegas (Boyd)</option>
            <option>Drake University</option>
            <option>Lewis & Clark College (Northwestern)</option>
            <option>Texas Tech University</option>
            <option>University of California College of Law, San Francisco</option>
            <option>University of Miami</option>
            <option>University of Nebraska</option>
            <option>University of Oregon</option>
            <option>Case Western Reserve University</option>
            <option>University of Denver (Sturm)</option>
            <option>Belmont University</option>
            <option>Louisiana State University – Baton Rouge (Hebert)</option>
            <option>University of Pittsburgh</option>
            <option>Duquesne University (Kline)</option>
            <option>Saint Louis University</option>
            <option>The Catholic University of America</option>
            <option>University of New Mexico</option>
            <option>American University (Washington)</option>
            <option>Indiana University (Indianapolis McKinney)</option>
            <option>Stetson University</option>
          </select>
        </div>
        <button
          type="submit"
          className="mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          Select School
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewSchool;
