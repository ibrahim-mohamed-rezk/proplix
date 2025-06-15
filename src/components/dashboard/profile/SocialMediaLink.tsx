import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

interface SocialMediaLinkProps {
  socialLinks: string[];
  onLinksChange: (links: string[]) => void;
  isUpdating: boolean;
}

const SocialMediaLink = ({
  socialLinks,
  onLinksChange,
  isUpdating
}: SocialMediaLinkProps) => {
  const [links, setLinks] = useState<string[]>(socialLinks || []);
  const [newLink, setNewLink] = useState("");
  const [linkError, setLinkError] = useState("");
  const t = useTranslations('ProfileBody');

  // URL validation function
  const isValidURL = (url: string): boolean => {
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return false;
      }

      const urlObj = new URL(url);

      if (!urlObj.hostname || urlObj.hostname.length === 0) {
        return false;
      }

      const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!domainPattern.test(urlObj.hostname)) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    setLinks(socialLinks || []);
  }, [socialLinks]);

  useEffect(() => {
    if (JSON.stringify(links) !== JSON.stringify(socialLinks)) {
      onLinksChange(links);
    }
  }, [links]);

  const handleAddLink = () => {
    const trimmedLink = newLink.trim();

    if (trimmedLink === "") {
      toast.error(t("Please enter a link"));
      return;
    }

    if (!isValidURL(trimmedLink)) {
      toast.error(t("Please enter a valid URL starting with http:// or https://"));
      return;
    }

    if (links.includes(trimmedLink)) {
      toast.error(t("This link already exists"));
      return;
    }

    const updatedLinks = [...links, trimmedLink];
    setLinks(updatedLinks);
    setNewLink("");
    setLinkError("");
    // toast.success("Social media link added successfully!");
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    setLinks(updatedLinks);
    toast.success(t("Social media link removed successfully!"));
  };

  const handleUpdateLink = (index: number, value: string) => {
    const updatedLinks = [...links];
    updatedLinks[index] = value;
    setLinks(updatedLinks);
  };

  const handleLinkBlur = (index: number, value: string) => {
    const trimmedValue = value.trim();

    if (trimmedValue && !isValidURL(trimmedValue)) {
      toast.error(t("Please enter a valid URL starting with http:// or https://"));
      return;
    }

    if (trimmedValue !== links[index]) {
      const updatedLinks = [...links];
      updatedLinks[index] = trimmedValue;
      setLinks(updatedLinks);
    }
  };

  const handleNewLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLink(e.target.value);
    if (linkError) {
      setLinkError("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLink();
    }
  };

  return (
    <div className="bg-white card-box mt-40">
      <h4 className="dash-title-three">{t("Social Media")}</h4>

      {links.length === 0 ? (
        <p>{t("No links found")}</p>
      ) : (
        links.map((link, index) => (
          <div className="dash-input-wrapper mb-20" key={index}>
            <label htmlFor={`social-link-${index}`}>{t("Network")} {index + 1}</label>
            <div className="d-flex gap-2">
              <input
                type="url"
                id={`social-link-${index}`}
                value={link}
                onChange={(e) => handleUpdateLink(index, e.target.value)}
                onBlur={(e) => handleLinkBlur(index, e.target.value)}
                placeholder="e.g., https://twitter.com/username"
                className={`flex-grow-1 ${!isValidURL(link) && link.trim() ? 'is-invalid' : ''}`}
              />
              <button
                type="button"
                onClick={() => handleRemoveLink(index)}
                className="btn btn-outline-danger btn-sm"
                disabled={isUpdating}
                title="Remove link"
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
            {/* Show validation error for individual links */}
            {!isValidURL(link) && link.trim() && (
              <div className="text-danger small mt-1">
                <i className="bi bi-exclamation-circle"></i> {t("Invalid URL format")}
              </div>
            )}
          </div>
        ))
      )}

      {/* Input form to add new social media links */}
      <div className="dash-input-wrapper mb-20">
        <label htmlFor="new-social-link">{t("Add a new social media link")}</label>
        <div className="d-flex gap-2">
          <input
            type="url"
            id="new-social-link"
            value={newLink}
            onChange={handleNewLinkChange}
            onKeyPress={handleKeyPress}
            placeholder="e.g., https://twitter.com/username"
            className={`flex-grow-1 ${linkError ? 'is-invalid' : ''}`}
          />

        </div>
        <button
          type="button"
          onClick={handleAddLink}
          className="dash-btn-one tran3s mt-2"
          style={{ width: "clamp(5px, 19vw, 19vh)" }}
          disabled={isUpdating || !newLink.trim()}
          title="Add new link"
        >
          <i className="bi bi-plus"></i>{t(" Add")}
        </button>
        {/* Show validation error */}
        {linkError && (
          <div className="text-danger small mt-1">
            <i className="bi bi-exclamation-circle"></i> {linkError}
          </div>
        )}
      </div>

      {/* Note: Links will be saved together with other profile data */}
      <div className="text-muted small">
        <i className="bi bi-info-circle"></i>{t(" Changes will be saved when you update your profile")}
      </div>
    </div>
  );
};

export default SocialMediaLink;