'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePopupContext } from '@/app/Context/ToastProvider';
import { FaTrash, FaSpinner } from 'react-icons/fa';

interface FormData {
  instituteName: string;
  instituteType: 'Online' | 'Offline' | 'Hybrid';
  instituteBio: string;
  instituteLogo: string;
  certifications: string;
  instituteAddress: {
    city: string;
    street: string;
    state: string;
    country: string;
    postalCode: string;
    specialIdentity: string;
  };
  instituteContact: {
    phone: string[];
    email: string[];
    website: string;
  };
  accreditation: {
    accreditingBody: string;
    accreditationStatus: string;
    accreditedUntil: string;
  };
}

type ErrorKeys =
  | 'instituteName'
  | 'instituteBio'
  | 'instituteLogo'
  | 'instituteContact.website'
  | `phone-${number}`
  | `email-${number}`;

const BasicInfoTab = ({
  formData,
  errors,
  handleChange,
}: {
  formData: FormData;
  errors: Record<ErrorKeys, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-stone-800 border-b border-stone-200 pb-2">Basic Information</h2>
    <div>
      <label htmlFor="instituteName" className="block text-sm font-medium text-stone-700">
        Institute Name <span className="text-orange-600">*</span>
      </label>
      <input
        type="text"
        id="instituteName"
        name="instituteName"
        value={formData.instituteName}
        onChange={handleChange}
        aria-invalid={!!errors.instituteName}
        aria-describedby={errors.instituteName ? 'instituteName-error' : undefined}
        aria-label="Institute Name"
        className={`mt-1 block w-full rounded-md border ${
          errors.instituteName ? 'border-orange-500' : 'border-stone-300'
        } shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2`}
      />
      {errors.instituteName && (
        <p id="instituteName-error" className="mt-1 text-sm text-orange-600">
          {errors.instituteName}
        </p>
      )}
    </div>
    <div>
      <label htmlFor="instituteType" className="block text-sm font-medium text-stone-700">
        Institute Type <span className="text-orange-600">*</span>
      </label>
      <select
        id="instituteType"
        name="instituteType"
        value={formData.instituteType}
        onChange={handleChange}
        aria-label="Institute Type"
        className="mt-1 block w-full rounded-md border border-stone-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
      >
        <option value="Online">Online</option>
        <option value="Offline">Offline</option>
        <option value="Hybrid">Hybrid</option>
      </select>
    </div>
    <div>
      <label htmlFor="instituteBio" className="block text-sm font-medium text-stone-700">
        Institute Bio <span className="text-orange-600">*</span>
      </label>
      <textarea
        id="instituteBio"
        name="instituteBio"
        rows={3}
        value={formData.instituteBio}
        onChange={handleChange}
        aria-invalid={!!errors.instituteBio}
        aria-describedby={errors.instituteBio ? 'instituteBio-error' : undefined}
        aria-label="Institute Bio"
        className={`mt-1 block w-full rounded-md border ${
          errors.instituteBio ? 'border-orange-500' : 'border-stone-300'
        } shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2`}
      />
      <p className="mt-1 text-xs text-stone-500">{formData.instituteBio.length}/500 characters</p>
      {errors.instituteBio && (
        <p id="instituteBio-error" className="mt-1 text-sm text-orange-600">
          {errors.instituteBio}
        </p>
      )}
    </div>
    <div>
      <label htmlFor="instituteLogo" className="block text-sm font-medium text-stone-700">
        Logo URL <span className="text-orange-600">*</span>
      </label>
      <input
        type="url"
        id="instituteLogo"
        name="instituteLogo"
        value={formData.instituteLogo}
        onChange={handleChange}
        aria-invalid={!!errors.instituteLogo}
        aria-describedby={errors.instituteLogo ? 'instituteLogo-error' : undefined}
        aria-label="Institute Logo URL"
        className={`mt-1 block w-full rounded-md border ${
          errors.instituteLogo ? 'border-orange-500' : 'border-stone-300'
        } shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2`}
        placeholder="https://example.com/logo.png"
      />
      {errors.instituteLogo && (
        <p id="instituteLogo-error" className="mt-1 text-sm text-orange-600">
          {errors.instituteLogo}
        </p>
      )}
    </div>
    <div>
      <label htmlFor="certifications" className="block text-sm font-medium text-stone-700">
        Certifications
      </label>
      <input
        type="text"
        id="certifications"
        name="certifications"
        value={formData.certifications}
        onChange={handleChange}
        aria-label="Certifications"
        className="mt-1 block w-full rounded-md border border-stone-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
      />
    </div>
  </div>
);

const AddressInfoTab = ({
  formData,
  handleChange,
}: {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-stone-800 border-b border-stone-200 pb-2">Address Information</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label htmlFor="instituteAddress.street" className="block text-sm font-medium text-stone-700">
          Street
        </label>
        <input
          type="text"
          id="instituteAddress.street"
          name="instituteAddress.street"
          value={formData.instituteAddress.street}
          onChange={handleChange}
          aria-label="Street Address"
          className="mt-1 block w-full rounded-md border border-stone-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
        />
      </div>
      <div>
        <label htmlFor="instituteAddress.city" className="block text-sm font-medium text-stone-700">
          City
        </label>
        <input
          type="text"
          id="instituteAddress.city"
          name="instituteAddress.city"
          value={formData.instituteAddress.city}
          onChange={handleChange}
          aria-label="City"
          className="mt-1 block w-full rounded-md border border-stone-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
        />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label htmlFor="instituteAddress.state" className="block text-sm font-medium text-stone-700">
          State/Province
        </label>
        <input
          type="text"
          id="instituteAddress.state"
          name="instituteAddress.state"
          value={formData.instituteAddress.state}
          onChange={handleChange}
          aria-label="State or Province"
          className="mt-1 block w-full rounded-md border border-stone-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
        />
      </div>
      <div>
        <label htmlFor="instituteAddress.country" className="block text-sm font-medium text-stone-700">
          Country
        </label>
        <input
          type="text"
          id="instituteAddress.country"
          name="instituteAddress.country"
          value={formData.instituteAddress.country}
          onChange={handleChange}
          aria-label="Country"
          className="mt-1 block w-full rounded-md border border-stone-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
        />
      </div>
      <div>
        <label htmlFor="instituteAddress.postalCode" className="block text-sm font-medium text-stone-700">
          Postal Code
        </label>
        <input
          type="text"
          id="instituteAddress.postalCode"
          name="instituteAddress.postalCode"
          value={formData.instituteAddress.postalCode}
          onChange={handleChange}
          aria-label="Postal Code"
          className="mt-1 block w-full rounded-md border border-stone-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
        />
      </div>
    </div>
    <div>
      <label htmlFor="instituteAddress.specialIdentity" className="block text-sm font-medium text-stone-700">
        Special Identity (if any)
      </label>
      <input
        type="text"
        id="instituteAddress.specialIdentity"
        name="instituteAddress.specialIdentity"
        value={formData.instituteAddress.specialIdentity}
        onChange={handleChange}
        aria-label="Special Identity"
        className="mt-1 block w-full rounded-md border border-stone-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
      />
    </div>
  </div>
);

const ContactInfoTab = ({
  formData,
  errors,
  handleChange,
  handleArrayChange,
  addArrayField,
  removeArrayField,
}: {
  formData: FormData;
  errors: Record<ErrorKeys, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleArrayChange: (parent: 'instituteContact.phone' | 'instituteContact.email', index: number, value: string) => void;
  addArrayField: (parent: 'instituteContact.phone' | 'instituteContact.email') => void;
  removeArrayField: (parent: 'instituteContact.phone' | 'instituteContact.email', index: number) => void;
}) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-stone-800 border-b border-stone-200 pb-2">Contact Information</h2>
    <div>
      <label className="block text-sm font-medium text-stone-700">
        Phone Numbers <span className="text-orange-600">*</span>
      </label>
      {formData.instituteContact.phone.map((phone, index) => (
        <div key={index} className="flex items-center mt-2">
          <input
            type="tel"
            value={phone}
            onChange={(e) => handleArrayChange('instituteContact.phone', index, e.target.value)}
            aria-invalid={!!errors[`phone-${index}`]}
            aria-describedby={errors[`phone-${index}`] ? `phone-${index}-error` : undefined}
            aria-label={`Phone Number ${index + 1}`}
            className={`flex-1 rounded-md border ${
              errors[`phone-${index}`] ? 'border-orange-500' : 'border-stone-300'
            } shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2`}
          />
          {formData.instituteContact.phone.length > 1 && (
            <button
              type="button"
              onClick={() => removeArrayField('instituteContact.phone', index)}
              className="ml-2 p-2 text-orange-600 hover:text-orange-800"
              aria-label={`Remove phone number ${index + 1}`}
            >
              <FaTrash className="h-5 w-5" />
            </button>
          )}
          {errors[`phone-${index}`] && (
            <p id={`phone-${index}-error`} className="mt-1 text-sm text-orange-600">
              {errors[`phone-${index}`]}
            </p>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => addArrayField('instituteContact.phone')}
        className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
      >
        Add Phone Number
      </button>
    </div>
    <div>
      <label className="block text-sm font-medium text-stone-700">
        Email Addresses <span className="text-orange-600">*</span>
      </label>
      {formData.instituteContact.email.map((email, index) => (
        <div key={index} className="flex items-center mt-2">
          <input
            type="email"
            value={email}
            onChange={(e) => handleArrayChange('instituteContact.email', index, e.target.value)}
            aria-invalid={!!errors[`email-${index}`]}
            aria-describedby={errors[`email-${index}`] ? `email-${index}-error` : undefined}
            aria-label={`Email Address ${index + 1}`}
            className={`flex-1 rounded-md border ${
              errors[`email-${index}`] ? 'border-orange-500' : 'border-stone-300'
            } shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2`}
          />
          {formData.instituteContact.email.length > 1 && (
            <button
              type="button"
              onClick={() => removeArrayField('instituteContact.email', index)}
              className="ml-2 p-2 text-orange-600 hover:text-orange-800"
              aria-label={`Remove email ${index + 1}`}
            >
              <FaTrash className="h-5 w-5" />
            </button>
          )}
          {errors[`email-${index}`] && (
            <p id={`email-${index}-error`} className="mt-1 text-sm text-orange-600">
              {errors[`email-${index}`]}
            </p>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => addArrayField('instituteContact.email')}
        className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
      >
        Add Email Address
      </button>
    </div>
    <div>
      <label htmlFor="instituteContact.website" className="block text-sm font-medium text-stone-700">
        Website <span className="text-orange-600">*</span>
      </label>
      <input
        type="url"
        id="instituteContact.website"
        name="instituteContact.website"
        value={formData.instituteContact.website}
        onChange={handleChange}
        aria-invalid={!!errors['instituteContact.website']}
        aria-describedby={errors['instituteContact.website'] ? 'website-error' : undefined}
        aria-label="Website URL"
        className={`mt-1 block w-full rounded-md border ${
          errors['instituteContact.website'] ? 'border-orange-500' : 'border-stone-300'
        } shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2`}
        placeholder="https://example.com"
      />
      {errors['instituteContact.website'] && (
        <p id="website-error" className="mt-1 text-sm text-orange-600">
          {errors['instituteContact.website']}
        </p>
      )}
    </div>
  </div>
);

const AccreditationInfoTab = ({
  formData,
  handleChange,
}: {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-stone-800 border-b border-stone-200 pb-2">
      Accreditation Information
    </h2>
    <div>
      <label htmlFor="accreditation.accreditingBody" className="block text-sm font-medium text-stone-700">
        Accrediting Body
      </label>
      <input
        type="text"
        id="accreditation.accreditingBody"
        name="accreditation.accreditingBody"
        value={formData.accreditation.accreditingBody}
        onChange={handleChange}
        aria-label="Accrediting Body"
        className="mt-1 block w-full rounded-md border border-stone-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
      />
    </div>
    <div>
      <label htmlFor="accreditation.accreditationStatus" className="block text-sm font-medium text-stone-700">
        Accreditation Status
      </label>
      <input
        type="text"
        id="accreditation.accreditationStatus"
        name="accreditation.accreditationStatus"
        value={formData.accreditation.accreditationStatus}
        onChange={handleChange}
        aria-label="Accreditation Status"
        className="mt-1 block w-full rounded-md border border-stone-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
      />
    </div>
    <div>
      <label htmlFor="accreditation.accreditedUntil" className="block text-sm font-medium text-stone-700">
        Accredited Until
      </label>
      <input
        type="date"
        id="accreditation.accreditedUntil"
        name="accreditation.accreditedUntil"
        value={formData.accreditation.accreditedUntil}
        onChange={handleChange}
        aria-label="Accredited Until Date"
        className="mt-1 block w-full rounded-md border border-stone-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
      />
    </div>
  </div>
);

export default function CreateInstitutePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<ErrorKeys, string>>({});
  const { Popup } = usePopupContext();
  const toast = Popup();
  const [formData, setFormData] = useState<FormData>({
    instituteName: '',
    instituteType: 'Online',
    instituteBio: '',
    instituteLogo: '',
    certifications: '',
    instituteAddress: {
      city: '',
      street: '',
      state: '',
      country: '',
      postalCode: '',
      specialIdentity: '',
    },
    instituteContact: {
      phone: [''],
      email: [''],
      website: '',
    },
    accreditation: {
      accreditingBody: '',
      accreditationStatus: '',
      accreditedUntil: '',
    },
  });
  const [activeTab, setActiveTab] = useState('basic');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof FormData],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    if (errors[name as ErrorKeys]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as ErrorKeys];
        return newErrors;
      });
    }
  };

  const handleArrayChange = (parent: 'instituteContact.phone' | 'instituteContact.email', index: number, value: string) => {
    setFormData((prev) => {
      const [section, field] = parent.split('.');
      const newArray = [...(prev[section as 'instituteContact'][field as 'phone' | 'email'])];
      newArray[index] = value;
      return {
        ...prev,
        [section]: {
          ...prev[section as 'instituteContact'],
          [field]: newArray,
        },
      };
    });
    if (errors[`${parent}-${index}` as ErrorKeys]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${parent}-${index}` as ErrorKeys];
        return newErrors;
      });
    }
  };

  const addArrayField = (parent: 'instituteContact.phone' | 'instituteContact.email') => {
    setFormData((prev) => {
      const [section, field] = parent.split('.');
      return {
        ...prev,
        [section]: {
          ...prev[section as 'instituteContact'],
          [field]: [...(prev[section as 'instituteContact'][field as 'phone' | 'email']), ''],
        },
      };
    });
  };

  const removeArrayField = (parent: 'instituteContact.phone' | 'instituteContact.email', index: number) => {
    setFormData((prev) => {
      const [section, field] = parent.split('.');
      const currentArray = prev[section as 'instituteContact'][field as 'phone' | 'email'];
      if (currentArray.length <= 1) return prev; // Prevent removing the last item
      const newArray = [...currentArray];
      newArray.splice(index, 1);
      return {
        ...prev,
        [section]: {
          ...prev[section as 'instituteContact'],
          [field]: newArray,
        },
      };
    });
  };

  const validateForm = () => {
    const newErrors: Record<ErrorKeys, string> = {};
    if (!formData.instituteName.trim()) {
      newErrors.instituteName = 'Institute name is required';
    }
    if (!formData.instituteBio.trim()) {
      newErrors.instituteBio = 'Institute bio is required';
    } else if (formData.instituteBio.length > 500) {
      newErrors.instituteBio = 'Bio cannot exceed 500 characters';
    }
    if (!formData.instituteLogo.trim()) {
      newErrors.instituteLogo = 'Institute logo is required';
    } else if (!/^https?:\/\/.+/i.test(formData.instituteLogo)) {
      newErrors.instituteLogo = 'Logo must be a valid URL';
    }
    formData.instituteContact.email.forEach((email, index) => {
      if (!email.trim()) {
        newErrors[`email-${index}` as ErrorKeys] = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors[`email-${index}` as ErrorKeys] = 'Invalid email address';
      }
    });
    formData.instituteContact.phone.forEach((phone, index) => {
      if (!phone.trim()) {
        newErrors[`phone-${index}` as ErrorKeys] = 'Phone number is required';
      }
    });
    if (!formData.instituteContact.website.trim()) {
      newErrors['instituteContact.website'] = 'Website is required';
    } else if (!/^https?:\/\/.+/i.test(formData.instituteContact.website)) {
      newErrors['instituteContact.website'] = 'Website must be a valid URL';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/institutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          accreditation: {
            ...formData.accreditation,
            accreditedUntil: formData.accreditation.accreditedUntil ? new Date(formData.accreditation.accreditedUntil) : null,
          },
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create institute');
      }
      toast.success('Institute created successfully!');
      router.push('/institutes');
    } catch (error) {
      console.error('Error creating institute:', error);
      toast.error('Failed to create institute. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Information' },
    { id: 'address', label: 'Address Information' },
    { id: 'contact', label: 'Contact Information' },
    { id: 'accreditation', label: 'Accreditation Information' },
  ];

  return (
    <div className="min-h-screen h-full overflow-y-auto bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-900">Create New Institute</h1>
          <p className="mt-2 text-stone-600">
            Fill out the form below to register your educational institute.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6 sm:p-8">
          <div className="border-b border-stone-200 mb-6">
            <nav className="flex space-x-4" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                    activeTab === tab.id
                      ? 'bg-orange-100 text-orange-700 border-b-2 border-orange-600'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          {activeTab === 'basic' && (
            <BasicInfoTab formData={formData} errors={errors} handleChange={handleChange} />
          )}
          {activeTab === 'address' && (
            <AddressInfoTab formData={formData} handleChange={handleChange} />
          )}
          {activeTab === 'contact' && (
            <ContactInfoTab
              formData={formData}
              errors={errors}
              handleChange={handleChange}
              handleArrayChange={handleArrayChange}
              addArrayField={addArrayField}
              removeArrayField={removeArrayField}
            />
          )}
          {activeTab === 'accreditation' && (
            <AccreditationInfoTab formData={formData} handleChange={handleChange} />
          )}
          <div className="pt-4 flex justify-between">
            <button
              type="button"
              onClick={() => {
                const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
                if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id);
              }}
              disabled={tabs.findIndex((tab) => tab.id === activeTab) === 0}
              className="py-3 px-4 border border-stone-300 rounded-md text-sm font-medium text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
                  if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1].id);
                }}
                disabled={tabs.findIndex((tab) => tab.id === activeTab) === tabs.length - 1}
                className="py-3 px-4 border border-stone-300 rounded-md text-sm font-medium text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-live="polite"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" />
                    Creating...
                  </>
                ) : (
                  'Create Institute'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}