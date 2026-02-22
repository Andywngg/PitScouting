import React from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import axios from 'axios';
import ImageUpload from '../components/ImageUpload';
import { motion } from 'framer-motion';
import endpoints from '../config/api';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

interface ScoutingFormValues {
  teamNumber: string;
  autoCanScoreBalls: boolean;
  mustStartSpecificPosition: boolean;
  autoStartingPosition: string;
  estimatedTotalPoints: string;
  pointContributionPercent: string;
  ballsPerCycle: string;
  cyclesPerMatch: string;
  maxBallCapacity: string;
  shootingTypes: string[];
  shootingLocationType: 'single' | 'multiple';
  shootingLocationNotes: string;
  endgameType: string;
  robotWidth: string;
  robotLength: string;
  robotHeight: string;
  robotWeight: string;
  drivetrainType: string;
  notes: string;
  canShareRobotImage: boolean;
  robotImage: File | null;
}

const toNullableNumber = (value: unknown, originalValue: unknown) => {
  if (originalValue === '' || originalValue === null || originalValue === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const ScoutingSchema = Yup.object().shape({
  teamNumber: Yup.number()
    .typeError('Team number must be a number')
    .required('Team number is required')
    .positive('Must be a positive number')
    .integer('Must be a whole number'),
  autoStartingPosition: Yup.string().when('mustStartSpecificPosition', {
    is: true,
    then: (schema) => schema.required('Starting position is required'),
    otherwise: (schema) => schema.nullable(),
  }),
  estimatedTotalPoints: Yup.number().nullable().transform(toNullableNumber).min(0, 'Must be 0 or higher'),
  pointContributionPercent: Yup.string().oneOf(['', '10', '20', '30', '40']),
  ballsPerCycle: Yup.number().nullable().transform(toNullableNumber).min(0, 'Must be 0 or higher'),
  cyclesPerMatch: Yup.number().nullable().transform(toNullableNumber).min(0, 'Must be 0 or higher'),
  maxBallCapacity: Yup.number().nullable().transform(toNullableNumber).min(0, 'Must be 0 or higher'),
  shootingTypes: Yup.array().of(Yup.string()),
  shootingLocationType: Yup.mixed<'single' | 'multiple'>().oneOf(['single', 'multiple']).required(),
  robotWidth: Yup.number().nullable().transform(toNullableNumber).min(0, 'Must be 0 or higher'),
  robotLength: Yup.number().nullable().transform(toNullableNumber).min(0, 'Must be 0 or higher'),
  robotHeight: Yup.number().nullable().transform(toNullableNumber).min(0, 'Must be 0 or higher'),
  robotWeight: Yup.number().nullable().transform(toNullableNumber).min(0, 'Must be 0 or higher'),
});

const sectionAnimation = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const percentOptions = [10, 20, 30, 40];
const shootingOptions = [
  { value: 'high_goal', label: 'High Goal' },
  { value: 'low_goal', label: 'Low Goal' },
  { value: 'fender_close', label: 'Close/Fender Shot' },
  { value: 'long_range', label: 'Long Range Shot' },
];

const endgameOptions = [
  { value: '', label: 'Unknown / Not Observed' },
  { value: 'high', label: 'High Endgame' },
  { value: 'low', label: 'Low Endgame' },
  { value: 'none', label: 'No Endgame Action' },
];

const drivetrainOptions = [
  { value: '', label: 'Select drivetrain type' },
  { value: 'swerve', label: 'Swerve Drive' },
  { value: 'tank', label: 'Tank Drive' },
  { value: 'mecanum', label: 'Mecanum Drive' },
  { value: 'other', label: 'Other' },
];

const Section: React.FC<{ title: string; subtitle?: string; delay: number; children: React.ReactNode }> = ({
  title,
  subtitle,
  delay,
  children,
}) => (
  <motion.section
    initial="hidden"
    animate="visible"
    variants={sectionAnimation}
    transition={{ duration: 0.35, delay }}
    className="rounded-2xl border border-amber-100/10 bg-slate-900/80 p-6 shadow-[0_24px_80px_-48px_rgba(251,113,133,0.85)] backdrop-blur"
  >
    <div className="mb-4">
      <h2 className="text-xl font-bold tracking-tight text-amber-100">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-300">{subtitle}</p> : null}
    </div>
    <div className="space-y-4">{children}</div>
  </motion.section>
);

const inputClasses =
  'mt-1 block w-full rounded-xl border border-slate-600/60 bg-slate-950/70 px-3 py-2 text-slate-50 placeholder-slate-400 focus:border-rose-400 focus:outline-none';

const labelClasses = 'block text-sm font-medium text-slate-200';

const ScoutingForm = () => {
  const navigate = useNavigate();

  const handleSubmit = async (
    values: ScoutingFormValues,
    { setSubmitting }: FormikHelpers<ScoutingFormValues>
  ) => {
    try {
      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (key === 'canShareRobotImage') {
          return;
        }

        if (key === 'robotImage') {
          if (value instanceof File) {
            formData.append('robotImage', value);
          }
          return;
        }

        if (key === 'shootingTypes') {
          formData.append(key, JSON.stringify(value));
          return;
        }

        if (typeof value === 'boolean') {
          formData.append(key, String(value));
          return;
        }

        if (value !== '' && value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      const token = localStorage.getItem('token');
      const response = await axios.post(endpoints.teams.create, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        toast.success('Team saved');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Error creating team:', error);
      toast.error(error.response?.data?.error || 'Failed to save team');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.2),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.2),transparent_35%),linear-gradient(165deg,#0f172a_15%,#020617_75%)] py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8 rounded-2xl border border-amber-100/10 bg-slate-900/75 p-6 shadow-[0_24px_80px_-48px_rgba(251,113,133,0.85)] backdrop-blur"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-rose-300">Team 1334</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-amber-50 sm:text-5xl">Pit Scouting 2026</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Updated for ball-based scoring. Capture point output, cycle speed, capacity, and shooting profile.
          </p>
        </motion.header>

        <Formik<ScoutingFormValues>
          initialValues={{
            teamNumber: '',
            autoCanScoreBalls: false,
            mustStartSpecificPosition: false,
            autoStartingPosition: '',
            estimatedTotalPoints: '',
            pointContributionPercent: '',
            ballsPerCycle: '',
            cyclesPerMatch: '',
            maxBallCapacity: '',
            shootingTypes: [],
            shootingLocationType: 'single',
            shootingLocationNotes: '',
            endgameType: '',
            robotWidth: '',
            robotLength: '',
            robotHeight: '',
            robotWeight: '',
            drivetrainType: '',
            notes: '',
            canShareRobotImage: false,
            robotImage: null,
          }}
          validationSchema={ScoutingSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, setFieldValue, isSubmitting }) => (
            <Form className="space-y-6">
              <Section title="Team" subtitle="Start with the team number for this pit interview." delay={0.05}>
                <div>
                  <label htmlFor="teamNumber" className={labelClasses}>
                    Team Number
                  </label>
                  <input
                    id="teamNumber"
                    name="teamNumber"
                    type="number"
                    value={values.teamNumber}
                    onChange={(event) => setFieldValue('teamNumber', event.target.value)}
                    className={inputClasses}
                    placeholder="e.g. 1334"
                  />
                  {touched.teamNumber && errors.teamNumber ? (
                    <p className="mt-1 text-xs text-rose-300">{errors.teamNumber}</p>
                  ) : null}
                </div>
              </Section>

              <Section
                title="Scoring Output"
                subtitle="Use event observations to estimate total points and percent share."
                delay={0.1}
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="estimatedTotalPoints" className={labelClasses}>
                      Estimated Total Points Scored
                    </label>
                    <input
                      id="estimatedTotalPoints"
                      name="estimatedTotalPoints"
                      type="number"
                      min="0"
                      value={values.estimatedTotalPoints}
                      onChange={(event) => setFieldValue('estimatedTotalPoints', event.target.value)}
                      className={inputClasses}
                      placeholder="e.g. 80"
                    />
                  </div>
                  <div>
                    <span className={labelClasses}>Approx. Percent of Alliance Points</span>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {percentOptions.map((option) => {
                        const isSelected = values.pointContributionPercent === String(option);
                        return (
                          <label
                            key={option}
                            className={clsx(
                              'cursor-pointer rounded-xl border px-3 py-2 text-center text-sm font-semibold transition',
                              isSelected
                                ? 'border-amber-300 bg-amber-300/20 text-amber-100'
                                : 'border-slate-600/70 bg-slate-900 text-slate-200 hover:border-rose-300/70 hover:text-rose-200'
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setFieldValue(
                                  'pointContributionPercent',
                                  isSelected ? '' : String(option)
                                );
                              }}
                              className="sr-only"
                            />
                            {option}%
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Cycle and Capacity" subtitle="Capture throughput and storage limits." delay={0.15}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label htmlFor="ballsPerCycle" className={labelClasses}>
                      Balls Per Cycle
                    </label>
                    <input
                      id="ballsPerCycle"
                      name="ballsPerCycle"
                      type="number"
                      min="0"
                      step="0.1"
                      value={values.ballsPerCycle}
                      onChange={(event) => setFieldValue('ballsPerCycle', event.target.value)}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label htmlFor="cyclesPerMatch" className={labelClasses}>
                      Cycles Per Match
                    </label>
                    <input
                      id="cyclesPerMatch"
                      name="cyclesPerMatch"
                      type="number"
                      min="0"
                      step="0.1"
                      value={values.cyclesPerMatch}
                      onChange={(event) => setFieldValue('cyclesPerMatch', event.target.value)}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label htmlFor="maxBallCapacity" className={labelClasses}>
                      Max Balls Carried
                    </label>
                    <input
                      id="maxBallCapacity"
                      name="maxBallCapacity"
                      type="number"
                      min="0"
                      value={values.maxBallCapacity}
                      onChange={(event) => setFieldValue('maxBallCapacity', event.target.value)}
                      className={inputClasses}
                    />
                  </div>
                </div>
              </Section>

              <Section
                title="Shooting Profile"
                subtitle="Track shot style and whether they need one fixed spot or can score from multiple locations."
                delay={0.2}
              >
                <div>
                  <span className={labelClasses}>Type of Shooting</span>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {shootingOptions.map((option) => {
                      const selected = values.shootingTypes.includes(option.value);
                      return (
                        <label
                          key={option.value}
                          className={clsx(
                            'flex cursor-pointer items-center rounded-xl border px-3 py-2 text-sm transition',
                            selected
                              ? 'border-rose-300 bg-rose-300/20 text-rose-100'
                              : 'border-slate-600/70 bg-slate-900 text-slate-200 hover:border-amber-200/60 hover:text-amber-100'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => {
                              if (selected) {
                                setFieldValue(
                                  'shootingTypes',
                                  values.shootingTypes.filter((item) => item !== option.value)
                                );
                              } else {
                                setFieldValue('shootingTypes', [...values.shootingTypes, option.value]);
                              }
                            }}
                            className="mr-2 h-4 w-4 accent-rose-400"
                          />
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className={labelClasses}>Shooting Location Requirement</span>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <label
                      className={clsx(
                        'cursor-pointer rounded-xl border px-3 py-2 text-sm transition',
                        values.shootingLocationType === 'single'
                          ? 'border-amber-300 bg-amber-300/20 text-amber-100'
                          : 'border-slate-600/70 bg-slate-900 text-slate-200'
                      )}
                    >
                      <input
                        type="radio"
                        name="shootingLocationType"
                        value="single"
                        checked={values.shootingLocationType === 'single'}
                        onChange={() => setFieldValue('shootingLocationType', 'single')}
                        className="mr-2 accent-amber-300"
                      />
                      Needs one spot
                    </label>
                    <label
                      className={clsx(
                        'cursor-pointer rounded-xl border px-3 py-2 text-sm transition',
                        values.shootingLocationType === 'multiple'
                          ? 'border-amber-300 bg-amber-300/20 text-amber-100'
                          : 'border-slate-600/70 bg-slate-900 text-slate-200'
                      )}
                    >
                      <input
                        type="radio"
                        name="shootingLocationType"
                        value="multiple"
                        checked={values.shootingLocationType === 'multiple'}
                        onChange={() => setFieldValue('shootingLocationType', 'multiple')}
                        className="mr-2 accent-amber-300"
                      />
                      Can score from multiple spots
                    </label>
                  </div>
                </div>

                {values.shootingLocationType === 'multiple' ? (
                  <div>
                    <label htmlFor="shootingLocationNotes" className={labelClasses}>
                      Multiple Spot Notes
                    </label>
                    <input
                      id="shootingLocationNotes"
                      name="shootingLocationNotes"
                      type="text"
                      value={values.shootingLocationNotes}
                      onChange={(event) => setFieldValue('shootingLocationNotes', event.target.value)}
                      className={inputClasses}
                      placeholder="e.g. wing + centerline"
                    />
                  </div>
                ) : null}
              </Section>

              <Section title="Autonomous and Endgame" delay={0.25}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="flex items-center rounded-xl border border-slate-600/70 bg-slate-950/70 px-3 py-2 text-sm text-slate-100">
                    <input
                      type="checkbox"
                      checked={values.autoCanScoreBalls}
                      onChange={(event) => setFieldValue('autoCanScoreBalls', event.target.checked)}
                      className="mr-2 h-4 w-4 accent-rose-400"
                    />
                    Can score balls in auto
                  </label>
                  <label className="flex items-center rounded-xl border border-slate-600/70 bg-slate-950/70 px-3 py-2 text-sm text-slate-100">
                    <input
                      type="checkbox"
                      checked={values.mustStartSpecificPosition}
                      onChange={(event) =>
                        setFieldValue('mustStartSpecificPosition', event.target.checked)
                      }
                      className="mr-2 h-4 w-4 accent-rose-400"
                    />
                    Must start in a specific spot
                  </label>
                </div>

                {values.mustStartSpecificPosition ? (
                  <div>
                    <label htmlFor="autoStartingPosition" className={labelClasses}>
                      Preferred Auto Starting Position
                    </label>
                    <input
                      id="autoStartingPosition"
                      name="autoStartingPosition"
                      type="text"
                      value={values.autoStartingPosition}
                      onChange={(event) => setFieldValue('autoStartingPosition', event.target.value)}
                      className={inputClasses}
                      placeholder="e.g. right side near source"
                    />
                    {touched.autoStartingPosition && errors.autoStartingPosition ? (
                      <p className="mt-1 text-xs text-rose-300">{errors.autoStartingPosition}</p>
                    ) : null}
                  </div>
                ) : null}

                <div>
                  <label htmlFor="endgameType" className={labelClasses}>
                    Endgame Strategy
                  </label>
                  <select
                    id="endgameType"
                    name="endgameType"
                    value={values.endgameType}
                    onChange={(event) => setFieldValue('endgameType', event.target.value)}
                    className={inputClasses}
                  >
                    {endgameOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </Section>

              <Section title="Robot Specs" delay={0.3}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="robotWidth" className={labelClasses}>
                      Width (in)
                    </label>
                    <input
                      id="robotWidth"
                      name="robotWidth"
                      type="number"
                      min="0"
                      step="0.1"
                      value={values.robotWidth}
                      onChange={(event) => setFieldValue('robotWidth', event.target.value)}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label htmlFor="robotLength" className={labelClasses}>
                      Length (in)
                    </label>
                    <input
                      id="robotLength"
                      name="robotLength"
                      type="number"
                      min="0"
                      step="0.1"
                      value={values.robotLength}
                      onChange={(event) => setFieldValue('robotLength', event.target.value)}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label htmlFor="robotHeight" className={labelClasses}>
                      Height (in)
                    </label>
                    <input
                      id="robotHeight"
                      name="robotHeight"
                      type="number"
                      min="0"
                      step="0.1"
                      value={values.robotHeight}
                      onChange={(event) => setFieldValue('robotHeight', event.target.value)}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label htmlFor="robotWeight" className={labelClasses}>
                      Weight (lb)
                    </label>
                    <input
                      id="robotWeight"
                      name="robotWeight"
                      type="number"
                      min="0"
                      step="0.1"
                      value={values.robotWeight}
                      onChange={(event) => setFieldValue('robotWeight', event.target.value)}
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="drivetrainType" className={labelClasses}>
                    Drivetrain
                  </label>
                  <select
                    id="drivetrainType"
                    name="drivetrainType"
                    value={values.drivetrainType}
                    onChange={(event) => setFieldValue('drivetrainType', event.target.value)}
                    className={inputClasses}
                  >
                    {drivetrainOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </Section>

              <Section title="Photos and Notes" delay={0.35}>
                <label className="flex items-center rounded-xl border border-slate-600/70 bg-slate-950/70 px-3 py-2 text-sm text-slate-100">
                  <input
                    type="checkbox"
                    checked={values.canShareRobotImage}
                    onChange={(event) => setFieldValue('canShareRobotImage', event.target.checked)}
                    className="mr-2 h-4 w-4 accent-rose-400"
                  />
                  Team allows robot photo
                </label>

                {values.canShareRobotImage ? (
                  <ImageUpload
                    name="robotImage"
                    label="Upload Robot Image"
                    onUpload={(file) => setFieldValue('robotImage', file)}
                  />
                ) : null}

                <div>
                  <label htmlFor="notes" className={labelClasses}>
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={values.notes}
                    onChange={(event) => setFieldValue('notes', event.target.value)}
                    className={inputClasses}
                    placeholder="Driver comments, reliability notes, alliance fit..."
                  />
                </div>
              </Section>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="pb-8 text-right"
              >
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  className="rounded-xl bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-rose-800/35 transition hover:scale-[1.01] hover:brightness-105"
                >
                  {isSubmitting ? 'Saving...' : 'Save Scouting Data'}
                </Button>
              </motion.div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ScoutingForm;
