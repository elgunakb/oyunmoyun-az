import React, { useId } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../Modal/Modal';

export default function PasswordModal({
  open,
  onClose,
  onSubmit,
  value,
  error,
  onChange,
}) {
  const titleId = useId();

  return (
    <Modal open={open} onClose={onClose} titleId={titleId}>
      <form
        onSubmit={onSubmit}
        className="mt-6 w-full mx-auto rounded-xl   p-4"
      >
        <h3 className="text-white font-semibold mb-3">
          Otaq şifrəsini daxil et
        </h3>
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-orange-400/60 mb-2"
          placeholder="Şifrə"
        />
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        <div className="flex gap-2 justify-end mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-white/10 text-white"
          >
            Ləğv et
          </button>
          <button
            type="submit"
            className="px-3 py-2 rounded-lg bg-orange-600 text-white font-semibold"
          >
            Qoşul
          </button>
        </div>
      </form>
    </Modal>
  );
}

PasswordModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
