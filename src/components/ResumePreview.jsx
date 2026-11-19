import { useLayoutEffect, useRef, useState } from 'react';
import { publicUrl, resumeUrl } from '../utils/publicUrl';
import LinkIcon from './LinkIcon';

import ActivityCount from './ActivityCount';
import { recordDownload } from '../hooks/useActivity';
const zoomLevels = [1, 1.25, 1.5, 2];

export default function ResumePreview() {
  const dialog = useRef(null);
  const trigger = useRef(null);
  const closeButton = useRef(null);
  const page = useRef(null);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(0);
  useLayoutEffect(() => { if (open) closeButton.current?.focus(); }, [open]);

  function show(event) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !dialog.current?.showModal) return;
    event.preventDefault();
    dialog.current.showModal();
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setZoom(0);
    trigger.current?.focus({ preventScroll: true });
  }

  function fitPage() {
    setZoom(0);
    page.current?.scrollTo(0, 0);
  }

  return <>
    <a className="icon-link" ref={trigger} href={resumeUrl} target="_blank" rel="noreferrer" aria-haspopup="dialog" onClick={show}><LinkIcon name="document" />Resume</a>
    <dialog className="resume-dialog" ref={dialog} aria-labelledby="resume-title" onClose={close} data-lenis-prevent>
      {open && <>
        <header className="resume-header">
          <div>
            <p className="eyebrow">Divyarajsinh Karmariya</p>
            <h2 id="resume-title">Resume</h2>
          </div>
          <div className="resume-header-actions">
            <a className="resume-download icon-link" href={resumeUrl} download aria-label="Download PDF" onClick={recordDownload}>
              <LinkIcon name="download" /><span className="resume-download-label">Download PDF</span>
            </a>
            <form method="dialog"><button type="submit" className="resume-close" ref={closeButton} aria-label="Close resume">×</button></form>
          </div>
        </header>
        <div className="resume-tools">
          <span className="resume-page-count">1 / 1 <span>PAGE</span></span>
          <div className="resume-zoom" role="group" aria-label="Preview zoom">
            <button type="button" aria-label="Zoom out" disabled={zoom === 0} onClick={() => setZoom(value => value - 1)}>−</button>
            <button type="button" className="resume-fit" onClick={fitPage} aria-label={`Reset preview to fit width (currently ${zoomLevels[zoom] * 100}%)`}>
              {zoom === 0 ? 'Fit width' : `${zoomLevels[zoom] * 100}%`}
            </button>
            <button type="button" aria-label="Zoom in" disabled={zoom === zoomLevels.length - 1} onClick={() => setZoom(value => value + 1)}>+</button>
          </div>
          <a className="resume-open" href={resumeUrl} target="_blank" rel="noreferrer" aria-label="Open accessible PDF in a new tab">Open PDF ↗</a>
        </div>
        <div className="resume-document" ref={page} role="region" aria-label="Resume page preview" tabIndex={0}>
          <img src={publicUrl('resume/resume-preview.webp')} width="1530" height="1980"
            style={{ width: `${zoomLevels[zoom] * 100}%` }}
            alt="Resume preview. Open the PDF for selectable text and links." />
        </div>
        <footer className="resume-status">
          <span>Resume downloads <ActivityCount kind="download"/></span>
        </footer>
      </>}
    </dialog>
  </>;
}
