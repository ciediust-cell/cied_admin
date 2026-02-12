import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, Award } from "lucide-react";

interface AwardFormPageProps {
  mode: "create" | "edit";
}

export default function AwardFormPage({ mode }: AwardFormPageProps) {
  const navigate = useNavigate();
  const params = useParams();
  const resolvedAwardId = params.awardId ? Number(params.awardId) : undefined;
  const [title, setTitle] = useState(
    mode === "edit" ? "Best Educational Institution of the Year" : "",
  );
  const [year, setYear] = useState(
    mode === "edit" ? "2026" : new Date().getFullYear().toString(),
  );
  const [category, setCategory] = useState(
    mode === "edit" ? "Institutional Excellence" : "",
  );
  const [recipient, setRecipient] = useState(
    mode === "edit" ? "Institution" : "",
  );
  const [description, setDescription] = useState(
    mode === "edit"
      ? "Recognized for outstanding academic performance, innovative teaching methodologies, and holistic student development."
      : "",
  );
  const [issuedBy, setIssuedBy] = useState(
    mode === "edit" ? "National Education Board" : "",
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving award:", {
      title,
      year,
      category,
      recipient,
      description,
      issuedBy,
      awardId: resolvedAwardId,
    });
    // Mock save logic
    alert(`Award ${mode === "create" ? "created" : "updated"} successfully!`);
    navigate("/dashboard/awards");
  };

  // Generate year options (current year + 10 years back)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: 21 },
    (_, i) => currentYear - 10 + i,
  ).reverse();

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/dashboard/awards")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Awards List
        </button>
        <h1 className="text-foreground mb-2">
          {mode === "create" ? "Add New Award" : "Edit Award"}
        </h1>
        <p className="text-muted-foreground">
          {mode === "create"
            ? "Add a new award or recognition to showcase achievements"
            : "Update the award details"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Award Information</h3>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-foreground mb-2">
                    Award Title <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="e.g., Best Educational Institution of the Year"
                    required
                  />
                </div>

                {/* Year and Category Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Year */}
                  <div>
                    <label
                      htmlFor="year"
                      className="block text-foreground mb-2"
                    >
                      Year <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="year"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    >
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-foreground mb-2"
                    >
                      Category <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Institutional Excellence">
                        Institutional Excellence
                      </option>
                      <option value="Academic Achievement">
                        Academic Achievement
                      </option>
                      <option value="Teaching Excellence">
                        Teaching Excellence
                      </option>
                      <option value="Sports">Sports</option>
                      <option value="Environmental">Environmental</option>
                      <option value="Technology">Technology</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Social Impact">Social Impact</option>
                      <option value="Innovation">Innovation</option>
                      <option value="Student Achievement">
                        Student Achievement
                      </option>
                      <option value="Research">Research</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Recipient */}
                <div>
                  <label
                    htmlFor="recipient"
                    className="block text-foreground mb-2"
                  >
                    Recipient
                  </label>
                  <input
                    id="recipient"
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="e.g., Institution, Science Department, Student Name"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Who received this award? (Optional)
                  </p>
                </div>

                {/* Issued By */}
                <div>
                  <label
                    htmlFor="issuedBy"
                    className="block text-foreground mb-2"
                  >
                    Issued By <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="issuedBy"
                    type="text"
                    value={issuedBy}
                    onChange={(e) => setIssuedBy(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="e.g., National Education Board"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Organization or authority that issued the award
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-foreground mb-2"
                  >
                    Description <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    placeholder="Provide details about the award and the achievement it recognizes..."
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {description.length} characters
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Preview */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-foreground mb-4">Preview</h3>

              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground mb-1">
                      {title || "Award Title"}
                    </p>
                    <p className="text-muted-foreground text-sm">{year}</p>
                  </div>
                </div>
                {category && (
                  <span className="inline-flex px-2 py-1 bg-primary/10 text-primary rounded text-xs mb-2">
                    {category}
                  </span>
                )}
                {recipient && (
                  <p className="text-muted-foreground text-xs mb-2">
                    Recipient: {recipient}
                  </p>
                )}
                {description && (
                  <p className="text-muted-foreground text-xs mb-2">
                    {description}
                  </p>
                )}
                {issuedBy && (
                  <p className="text-muted-foreground text-xs italic">
                    Issued by: {issuedBy}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity"
                >
                  <Save className="w-4 h-4" />
                  {mode === "create" ? "Create Award" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/awards")}
                  className="flex items-center justify-center gap-2 bg-muted text-foreground px-4 py-2.5 rounded-md hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
