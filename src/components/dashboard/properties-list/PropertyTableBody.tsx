import Image from "next/image";
import React, { useState } from "react";
import { useLocale } from "next-intl";
import { deleteData } from "@/libs/server/backendServer";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

// Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  locale = "en",
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  locale?: string;
}) => {
  if (!isOpen) return null;

  // Determine if the locale is RTL based on the locale string
  const isRTL = locale === "ar";
  const direction = isRTL ? "rtl" : "ltr";

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      dir={direction}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div
            className={`modal-header ${
              isRTL ? "justify-content-between flex-row-reverse" : ""
            }`}
          >
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className={`modal-body ${isRTL ? "text-end" : "text-start"}`}>
            <p className="mb-0">{message}</p>
          </div>
          <div className={`modal-footer ${isRTL ? "flex-row-reverse" : ""}`}>
            <button
              type="button"
              className={`btn btn-secondary ${isRTL ? "ms-2" : "me-2"}`}
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PropertyTableBody = ({
  properties,
  onPropertyDeleted,
  token,
}: {
  properties: any;
  onPropertyDeleted?: (id: string) => void;
  token: string;
}) => {
  const locale = useLocale();
  const [showModal, setShowModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const t = useTranslations("table");
  const tProps = useTranslations("properties");

  const handleDeleteClick = (propertyId: string) => {
    setPropertyToDelete(propertyId);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return;

    try {
      await deleteData(`agent/property_listings/${propertyToDelete}`, {
        Authorization: `Bearer ${token}`,
      });
      if (onPropertyDeleted) {
        onPropertyDeleted(propertyToDelete);
      }
      toast.success(t("property_deleted_successfully"));
      // reload page
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete property:", error);
      toast.error(t("failed_to_delete_property"));
    } finally {
      setShowModal(false);
      setPropertyToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPropertyToDelete(null);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Helper function to get status background class
  const getStatusBgClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "rent":
        return "bg-success";
      case "sale":
        return "bg-primary";
      case "pending":
        return "bg-warning";
      default:
        return "bg-secondary";
    }
  };

  // Helper function to capitalize status
  const capitalizeStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <>
      <tbody className="border-0">
        {properties &&
          properties.map((item: any) => (
            <tr key={item.id}>
              <td>
                <div
                  className=" align-items-center position-relative"
                  style={{ gap: "10px" }}
                >
                  <Image
                    src={item?.cover}
                    width={100}
                    height={100}
                    alt=""
                    className="p-img"
                    style={{ objectFit: "cover" }}
                  />
                  {/* <div className="ps-lg-4 md-pt-10">
                    <a
                      href="#"
                      className="property-name tran3s color-dark fw-500 fs-20 stretched-link"
                    >
                      {item.title}
                    </a>
                    <div className="address">
                      {item.area?.description?.en?.name ||
                        item.area?.name ||
                        "No address"}
                    </div>
                    <strong className="price color-dark">${item.price}</strong>
                  </div> */}
                </div>
              </td>
              <td>{item.title}</td>
              <td>{item.price} EGP</td>
              <td>{formatDate(item.created_at)}</td>
              <td>{item.views || 0}</td>
              <td>
                <div
                  className={`property-status ${getStatusBgClass(
                    item.status
                  )} text-white px-2 py-1 rounded`}
                >
                  {capitalizeStatus(item.status)}
                </div>
              </td>
              <td>
                <div className="action-dots float-end px-4">
                  <button
                    className="action-btn dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <span></span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    {/* <li>
                      <a
                        className="dropdown-item"
                        href={`/${locale}/dashboard/add-property`}
                      >
                        <Image
                          width={10}
                          height={10}
                          src="/icon_19.svg"
                          alt=""
                          className="lazy-img"
                        />{" "}
                        {tProps("Create Property")}
                      </a>
                    </li> */}
                    <li>
                      <a
                        className="dropdown-item"
                        href={`/${locale}/dashboard/edit-property/${item.id}`}
                      >
                        <Image
                          width={10}
                          height={10}
                          src="/icon_20.svg"
                          alt=""
                          className="lazy-img"
                        />
                        {t("view_edit")}
                      </a>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleDeleteClick(item.id)}
                        style={{
                          border: "none",
                          background: "none",
                          width: "100%",
                          textAlign: "left",
                        }}
                      >
                        <Image
                          width={10}
                          height={10}
                          src="/icon_21.svg"
                          alt=""
                          className="lazy-img"
                        />{" "}
                        {t("delete")}
                      </button>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
          ))}
      </tbody>

      <ConfirmationModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title={t("confirm_delete")}
        message={t("confirm_delete_message")}
        confirmText={t("delete")}
        cancelText={tProps("Cancel")}
        locale={locale}
      />
    </>
  );
};

export default PropertyTableBody;
