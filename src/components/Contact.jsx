import Glass from './Glass';
import { useRef, useState } from 'react';
import FloatingModel from './FloatingModel';
import LinkIcon from './LinkIcon';

const Contact = () => {
  const sending=useRef(false);
  const [honey,setHoney]=useState('');
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { target } = e;
    const { name, value } = target;

    setForm(previous => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending.current || honey) return;
    sending.current=true;
    setLoading(true);
    setStatus('');

    try {
      const { default: emailjs } = await import('@emailjs/browser');
      await emailjs.send(
        'service_raibf13',
        'template_pkulou1',
        {
          from_name: form.name,
          to_name: "Divyarajsinh Karmariya",
          from_email: form.email,
          reply_to: form.email,
          to_email: "divyarajsinhkarmariya@gmail.com",
          message: form.message,
        },
        'BXpAYvRhlMHHbpQ1x'
      );
      setStatus("Message received. I’ll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      console.error('Contact delivery:', error.status ?? error.name, error.text ?? error.message);
      setStatus("Couldn’t send your message. Please try again or email me directly.");
    } finally {
      sending.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="contact-deck" data-scene-reveal>
      <div className="contact-intro">
        <div className="contact-copy text-shield">
          <p className="eyebrow">Get in touch</p>
          <h2>Say hello.<br/><em>I’m listening.</em></h2>
          <p className="contact-lede">Want to talk about a role, a project, or something I’ve built? Send me a note.</p>
        </div>
        <FloatingModel object="planet" className="contact-planet" interactive/>
        <a className="contact-direct icon-link text-shield" href="mailto:divyarajsinhkarmariya@gmail.com">Email me directly <LinkIcon name="mail" /></a>
        <div className="contact-socials text-shield">
          <a className="icon-link" href="https://www.linkedin.com/in/dkarmariya/" target="_blank" rel="noreferrer"><LinkIcon name="linkedin" />LinkedIn</a>
          <a className="icon-link" href="https://github.com/Iamdk25" target="_blank" rel="noreferrer"><LinkIcon name="github" />GitHub</a>
        </div>
      </div>
      <div className="contact-form-shell">
        <Glass panel block radius={30} className="contact-glass">
          <div className="contact-panel-top"><span><i aria-hidden="true"/> Start a conversation</span><span aria-hidden="true">↗</span></div>
          <form onSubmit={handleSubmit} className="contact-form">
            <label className="contact-honey" aria-hidden="true">Leave empty<input name="company_url" value={honey} onChange={event=>setHoney(event.target.value)} autoComplete="off" tabIndex={-1}/></label><div className="contact-form-heading"><h3>Leave me<br/>a message.</h3><p>I’ll get back to you by email.</p></div>
            <label><span>Your name</span><input required autoComplete="name" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your name"/></label>
            <label><span>Email address</span><input required autoComplete="email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com"/></label>
            <label><span>What’s on your mind?</span><textarea required data-lenis-prevent rows={4} name="message" value={form.message} onChange={handleChange} placeholder="Tell me a little about it…"/></label>
            <button type="submit" disabled={loading} className="contact-send icon-link"><span>{loading ? 'Sending…' : 'Send message'}</span><LinkIcon name="send" /></button>
            <p role="status" className="contact-status">{status}</p>{status.startsWith("Couldn’t")&&<a className="contact-mail-fallback" href={`mailto:divyarajsinhkarmariya@gmail.com?subject=${encodeURIComponent(`Portfolio message from ${form.name}`)}&body=${encodeURIComponent(`${form.message}\n\nReply to: ${form.email}`)}`}>Send this message with your email app ↗</a>}
          </form>
          <div className="contact-panel-footer"><span>Tampa, Florida</span><span>Thanks for stopping by.</span></div>
        </Glass>
      </div>
    </div>
  );
};

export default Contact;
