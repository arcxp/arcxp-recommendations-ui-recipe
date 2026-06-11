// Minimal jest mock of @wpmedia/arc-themes-components.
//
// The real package is published to GitHub Packages (private registry) and is
// not installed in this recipe. The block code imports the real component set
// so it is standard-compliant and drops cleanly into arc-themes-blocks; this
// mock lets the recipe's jest suite exercise that code without the registry.
// Each component renders simple, queryable DOM.
const React = require('react');

const usePhrases = () => ({
  t: (key, vars) => (vars ? `${key} ${JSON.stringify(vars)}` : key),
});

const getImageFromANS = (item) => {
  const url = item && item.promo_items && item.promo_items.basic && item.promo_items.basic.url;
  return url ? { url } : undefined;
};

const Heading = ({ children, className }) => React.createElement('h3', { className }, children);
const HeadingSection = ({ children }) => React.createElement(React.Fragment, null, children);
const Paragraph = ({ children, className }) => React.createElement('p', { className }, children);
const Stack = ({ children, className }) => React.createElement('div', { className }, children);
const Icon = ({ name }) => React.createElement('span', { 'data-icon': name });
const Image = ({ src, alt }) => React.createElement('img', { src, alt });
const Link = ({ children, href, className, openInNewTab }) =>
  React.createElement(
    'a',
    { href, className, target: openInNewTab ? '_blank' : undefined },
    children,
  );

const Carousel = ({ children, label, previousButton, nextButton }) =>
  React.createElement(
    'div',
    { 'data-carousel': true, 'aria-label': label },
    previousButton,
    children,
    nextButton,
  );
Carousel.Button = ({ children, label }) =>
  React.createElement('button', { type: 'button', 'aria-label': label }, children);
Carousel.Item = ({ children, label }) =>
  React.createElement(
    'div',
    { 'data-carousel-item': true, 'aria-label': label },
    typeof children === 'function' ? children({ viewable: true }) : children,
  );

module.exports = {
  Carousel,
  getImageFromANS,
  Heading,
  HeadingSection,
  Icon,
  Image,
  Link,
  Paragraph,
  Stack,
  usePhrases,
};
